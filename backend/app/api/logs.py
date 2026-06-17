from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import models
from .auth import get_current_user
from ..services import logs_service
from ..core.permissions import ensure_admin

router = APIRouter(
    prefix="/logs",
    tags=["logs"]
)

@router.get("/", response_model=List[dict])
def get_logs(
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None,
    accion: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Consulta la trazabilidad total de acciones en el sistema (Solo Administradores)."""
    ensure_admin(current_user.rol, "No tienes privilegios para consultar la auditoría del sistema")
    
    return logs_service.get_logs_auditoria(
        db=db, 
        admin_role=current_user.rol, 
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        accion=accion,
        skip=skip, 
        limit=limit
    )

