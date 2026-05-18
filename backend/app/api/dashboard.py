from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import dashboard_service
from ..api.auth import get_current_user
from ..models import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene estadísticas de rendimiento y KPIs según el rol del usuario."""
    return dashboard_service.get_dashboard_stats(
        db=db, 
        user_id=current_user.id_usuario, 
        role=current_user.rol,
        nombres=current_user.nombres
    )
