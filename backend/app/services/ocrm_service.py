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

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo se soportan archivos CSV")

    content = await file.read()
    try:
        decoded_content = content.decode('utf-8')
    except UnicodeDecodeError:
        decoded_content = content.decode('latin-1')

    csv_reader = csv.DictReader(StringIO(decoded_content))
    
    # Obtener todos los pagos pendientes
    pagos_pendientes = db.query(models.Pago).join(models.Pago.usuario).filter(
        models.Pago.estado_pago == "PENDIENTE"
    ).all()
    
    resultados = []
    
    for row in csv_reader:
        try:
            monto_banco_str = str(row.get('Monto', '0')).replace(',', '').strip()
            monto_banco = Decimal(monto_banco_str)
        except:
            continue
            
        descripcion = row.get('Descripcion', '')
        fecha_banco_str = row.get('Fecha', '').strip()
        
        if monto_banco <= 0:
            continue # Ignorar egresos o ceros
            
        mejor_match = None
        mejor_similitud = 0.0
        
        # Intentar parsear la fecha de la transacción del extracto para correlación temporal
        fecha_banco_parsed = None
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y'):
            try:
                fecha_banco_parsed = datetime.strptime(fecha_banco_str, fmt).date()
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