from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from .auth import get_current_user

router = APIRouter(
    prefix="/logs",
    tags=["logs"]
)

@router.get("/", response_model=List[dict])
def get_logs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Solo el ADMIN puede ver los logs de auditoría
    if current_user.rol != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para ver los logs")
        
    logs = db.query(models.LogSistema).order_by(models.LogSistema.fecha.desc()).offset(skip).limit(limit).all()
    
    # Convertir a formato legible
    result = []
    for log in logs:
        result.append({
            "id_log": log.id_log,
            "id_admin": log.id_admin,
            "accion": log.accion,
            "tabla_afectada": log.tabla_afectada,
            "id_registro_afectado": log.id_registro_afectado,
            "fecha": log.fecha,
            "valor_anterior": log.valor_anterior,
            "valor_nuevo": log.valor_nuevo,
            "ip_direccion": log.ip_direccion
        })
    return result
