import csv
from decimal import Decimal
from io import StringIO
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from ..models import models
from ..core.permissions import ensure_permission, PERMISSION_PAYMENTS_VALIDATE
from ..utils.similarity import check_name_in_description_fuzzy

async def procesar_extracto_bancario(
    db: Session,
    current_user: models.Usuario,
    file: UploadFile
) -> List[Dict]:
    ensure_permission(current_user.rol, PERMISSION_PAYMENTS_VALIDATE, "No tienes permisos para validar pagos")

    filename = file.filename.lower()
    if not (filename.endswith('.csv') or filename.endswith('.xlsx')):
        raise HTTPException(status_code=400, detail="Solo se soportan archivos CSV o Excel (.xlsx)")

    content = await file.read()
    all_rows = []

    if filename.endswith('.xlsx'):
        try:
            import openpyxl
            from io import BytesIO
            wb = openpyxl.load_workbook(BytesIO(content), data_only=True)
            sheet = wb.active
            for row in sheet.iter_rows(values_only=True):
                all_rows.append([str(cell) if cell is not None else "" for cell in row])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al leer el archivo Excel: {str(e)}")
    else:
        try:
            decoded_content = content.decode('utf-8')
        except UnicodeDecodeError:
            decoded_content = content.decode('latin-1')

        # 1. Detectar delimitador leyendo las primeras líneas
        sample = decoded_content[:1500]
        delimiter = ','
        if ';' in sample and sample.count(';') > sample.count(','):
            delimiter = ';'

        # 2. Leer todas las filas del CSV
        csv_reader = csv.reader(StringIO(decoded_content), delimiter=delimiter)
        all_rows = list(csv_reader)

    # 3. Buscar la fila de cabecera automáticamente
    header_row_idx = -1
    col_fecha = -1
    col_monto = -1
    col_desc_primary = -1

    # Sinónimos para detección de columnas
    sinonimos_fecha = ['fecha', 'date', 'fec']
    sinonimos_desc = ['glosa', 'descripcion', 'descripción', 'concepto', 'detalle', 'glosas', 'description', 'tipo']
    sinonimos_monto = ['crédito', 'credito', 'abono', 'deposito', 'monto', 'importe', 'credit', 'créditos', 'abonos', 'ingreso']

    for idx, row in enumerate(all_rows):
        row_clean = [cell.lower().strip() for cell in row]
        
        f_idx = next((i for i, cell in enumerate(row_clean) if any(s in cell for s in sinonimos_fecha)), -1)
        d_idx = next((i for i, cell in enumerate(row_clean) if any(s in cell for s in sinonimos_desc)), -1)
        m_idx = next((i for i, cell in enumerate(row_clean) if any(s in cell for s in sinonimos_monto)), -1)
        
        # Si detectamos al menos fecha, glosa/descripción y monto de abono, esta es nuestra cabecera
        if f_idx != -1 and d_idx != -1 and m_idx != -1:
            header_row_idx = idx
            col_fecha = f_idx
            col_desc_primary = d_idx
            col_monto = m_idx
            break

    # Si no se detecta cabecera automáticamente, usar valores por defecto en la fila 0
    if header_row_idx == -1:
        header_row_idx = 0
        col_fecha = 0
        col_desc_primary = 1
        col_monto = 2

    # Encontrar todas las columnas descriptivas para concatenar (ej. Tipo + Glosa)
    col_desc_indices = []
    header_cells = [cell.lower().strip() for cell in all_rows[header_row_idx]]
    for i, cell in enumerate(header_cells):
        if any(s in cell for s in sinonimos_desc):
            col_desc_indices.append(i)
            
    if not col_desc_indices:
        col_desc_indices = [col_desc_primary]

    # Obtener todas las filas de datos (posteriores a la cabecera)
    data_rows = all_rows[header_row_idx + 1:]

    # Obtener todos los pagos pendientes y en revisión manual
    pagos_pendientes = db.query(models.Pago).join(models.Pago.usuario).filter(
        models.Pago.estado_pago.in_(["PENDIENTE", "REVISION_MANUAL"])
    ).all()
    
    resultados = []
    
    for row in data_rows:
        if not row or len(row) <= max(col_fecha, col_monto):
            continue
            
        # Parsear el monto
        monto_raw = row[col_monto].strip()
        if not monto_raw:
            continue
            
        # Limpiar el monto (quitar símbolos de moneda, comas de miles)
        monto_clean = monto_raw.replace('Bs.', '').replace('$', '').replace(' ', '').strip()
        if ',' in monto_clean and '.' not in monto_clean:
            monto_clean = monto_clean.replace(',', '.')
        else:
            monto_clean = monto_clean.replace(',', '')
            
        try:
            monto_banco = Decimal(monto_clean)
        except:
            continue
            
        if monto_banco <= 0:
            continue # Ignorar egresos o montos vacíos

        # Concatenar todos los campos descriptivos de la fila (ej: Tipo - Glosa)
        desc_parts = []
        for d_idx in col_desc_indices:
            if d_idx < len(row):
                desc_parts.append(row[d_idx].strip())
        descripcion = " - ".join([p for p in desc_parts if p])

        fecha_banco_str = row[col_fecha].strip()
        
        mejor_match = None
        mejor_similitud = 0.0
        
        # Intentar parsear la fecha de la transacción del extracto
        fecha_banco_parsed = None
        # Quitamos la hora si está presente (ej. "10/06/2026 09:05" -> "10/06/2026")
        fecha_banco_clean = fecha_banco_str.split()[0] if fecha_banco_str else ""
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y'):
            try:
                fecha_banco_parsed = datetime.strptime(fecha_banco_clean, fmt).date()
                break
            except ValueError:
                continue

        for pago in pagos_pendientes:
            if pago.monto == monto_banco:
                nombre_completo = f"{pago.usuario.nombres} {pago.usuario.apellidos}"
                
                # 1. Coincidencia difusa de Jaro-Winkler sobre palabras del nombre
                similitud_base = check_name_in_description_fuzzy(nombre_completo, descripcion)
                
                # 2. Correlación de fecha (Si coinciden en un rango de ±3 días, sumamos bonus de confianza)
                fecha_pago_date = pago.fecha_pago.date() if isinstance(pago.fecha_pago, datetime) else pago.fecha_pago
                if fecha_banco_parsed and fecha_pago_date:
                    dias_diferencia = abs((fecha_banco_parsed - fecha_pago_date).days)
                    if dias_diferencia <= 1:
                        similitud_base += 15.0 # Alto bonus por fecha exacta
                    elif dias_diferencia <= 3:
                        similitud_base += 5.0  # Bonus menor por cercanía
                        
                # 3. Búsqueda de códigos de transacción / ID de pago en la descripción del extracto
                # Para evitar falsos positivos con dígitos cortos (ej. ID 2 match con "29" o un hash "Jose24b5"),
                # normalizamos y buscamos el ID exacto como una palabra completa.
                norm_desc_id = descripcion.lower()
                for punc in '.,-_/\\()[]{}':
                    norm_desc_id = norm_desc_id.replace(punc, ' ')
                desc_words_id = norm_desc_id.split()
                
                pago_id_str = str(pago.id_pago)
                if pago_id_str in desc_words_id:
                    similitud_base = max(similitud_base, 100.0) # Match perfecto por ID de Pago

                # 4. Búsqueda de códigos de transacción largos (números >= 6 dígitos) en el texto OCR del pago
                import re
                codigos_banco = re.findall(r'\b\d{6,}\b', descripcion)
                if codigos_banco and pago.texto_ocr:
                    for cod in codigos_banco:
                        if cod in pago.texto_ocr:
                            similitud_base = max(similitud_base, 100.0) # Match perfecto por código de transacción/QR
                            break
                
                # Limitar similitud a 100%
                similitud_final = min(similitud_base, 100.0)

                if similitud_final > mejor_similitud:
                    mejor_similitud = similitud_final
                    mejor_match = pago
        
        match_info = {
            "fecha_banco": fecha_banco_str,
            "descripcion_banco": descripcion,
            "monto_banco": float(monto_banco),
            "match_encontrado": False,
            "similitud": 0.0,
            "id_pago": None,
            "usuario_pago": None,
            "monto_pago": None
        }
        
        # Solo consideramos coincidencia si supera un umbral mínimo aceptable (ej. 60%)
        if mejor_match and mejor_similitud >= 60.0:
            match_info.update({
                "match_encontrado": True,
                "similitud": round(mejor_similitud, 2),
                "id_pago": mejor_match.id_pago,
                "usuario_pago": f"{mejor_match.usuario.nombres} {mejor_match.usuario.apellidos}",
                "monto_pago": float(mejor_match.monto)
            })
            # Removerlo de pendientes temporalmente para no duplicar coincidencias
            pagos_pendientes.remove(mejor_match)
            
        resultados.append(match_info)
        
    return resultados