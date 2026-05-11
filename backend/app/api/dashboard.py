from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import dashboard_service
from ..api.auth import get_current_user
from ..models import models

from ..core.permissions import PERMISSION_AUDIT_READ, ensure_permission

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_AUDIT_READ, "No tienes permisos para ver estadísticas")
    return dashboard_service.get_dashboard_stats(db, current_user)
