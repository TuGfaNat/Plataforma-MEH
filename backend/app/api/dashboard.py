from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import dashboard_service
from ..api.auth import get_current_user
from ..models import models
from ..core.permissions import ensure_permission, PERMISSION_AUDIT_READ

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene estadísticas de rendimiento y KPIs globales (Solo Administradores)."""
    ensure_permission(current_user.rol, PERMISSION_AUDIT_READ, "No tienes privilegios para consultar estadísticas globales")
    return dashboard_service.get_dashboard_stats(
        db=db, 
        user_id=current_user.id_usuario, 
        role=current_user.rol,
        nombres=current_user.nombres
    )

@router.get("/personal-stats")
def get_personal_stats(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene estadísticas personales del miembro logueado (Cualquier usuario)."""
    return dashboard_service.get_personal_dashboard_stats(
        db=db, 
        user_id=current_user.id_usuario, 
        role=current_user.rol,
        nombres=current_user.nombres
    )

