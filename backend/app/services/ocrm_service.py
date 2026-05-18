import csv
from decimal import Decimal
from io import StringIO
from typing import List, Dict, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from ..models import models
from ..core.permissions import ensure_permission, PERMISSION_PAYMENTS_VALIDATE

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
    # We assume CSV has headers: Fecha, Descripcion, Monto
    # Adjust based on standard bank extracts, but let's assume this for the spec.
    
    # Get all pending payments
    pagos_pendientes = db.query(models.Pago).join(models.Usuario).filter(
        models.Pago.estado_pago == "PENDIENTE"
    ).all()
    
    resultados = []
    
    for row in csv_reader:
        try:
            monto_banco_str = str(row.get('Monto', '0')).replace(',', '')
            monto_banco = Decimal(monto_banco_str)
        except:
            continue
            
        descripcion = row.get('Descripcion', '').lower()
        fecha_banco = row.get('Fecha', '')
        
        if monto_banco <= 0:
            continue # Ignorar egresos o ceros
            
        mejor_match = None
        mejor_similitud = 0
        
        for pago in pagos_pendientes:
            if pago.monto == monto_banco:
                # Comparamos nombre
                nombre_completo = f"{pago.usuario.nombres} {pago.usuario.apellidos}".lower()
                similitud = 0
                
                # Heurística simple: contar palabras del nombre que aparecen en la descripción del banco
                palabras_nombre = nombre_completo.split()
                matches = sum(1 for palabra in palabras_nombre if palabra in descripcion)
                
                if len(palabras_nombre) > 0:
                    similitud = (matches / len(palabras_nombre)) * 100
                
                if similitud > mejor_similitud:
                    mejor_similitud = similitud
                    mejor_match = pago
        
        match_info = {
            "fecha_banco": fecha_banco,
            "descripcion_banco": descripcion,
            "monto_banco": float(monto_banco),
            "match_encontrado": False,
            "similitud": 0,
            "id_pago": None,
            "usuario_pago": None,
            "monto_pago": None
        }
        
        if mejor_match:
            match_info.update({
                "match_encontrado": True,
                "similitud": round(mejor_similitud, 2),
                "id_pago": mejor_match.id_pago,
                "usuario_pago": f"{mejor_match.usuario.nombres} {mejor_match.usuario.apellidos}",
                "monto_pago": float(mejor_match.monto)
            })
            # Removerlo de pendientes temporalmente para no matchear 2 veces el mismo
            pagos_pendientes.remove(mejor_match)
            
        resultados.append(match_info)
        
    return resultados