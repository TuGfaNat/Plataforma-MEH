from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import dashboard_service
from ..api.auth import get_current_user
from ..models import models
from typing import Optional, List
from ..core.permissions import ADMIN_OR_ORGANIZER_ROLES, ensure_roles
from ..services import auth_service
from ..schemas import user as user_schema

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    q: Optional[str] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    fechas: Optional[str] = None,
    modalidad: Optional[str] = None,
    estado: Optional[str] = None,
    id_eventos: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene estadísticas de rendimiento y KPIs con filtros de eventos (Solo ADMIN/ORGANIZADOR)."""
    return dashboard_service.get_filtered_dashboard_stats(
        db=db,
        current_user=current_user,
        q=q,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        fechas=fechas,
        modalidad=modalidad,
        estado=estado,
        id_eventos=id_eventos
    )

@router.get("/directorio", response_model=List[user_schema.DirectorioMiembroResponse])
def get_directorio_dashboard(
    search: Optional[str] = None,
    q: Optional[str] = None,
    rol: Optional[str] = None,
    sort_by: Optional[str] = "nombres",
    sort_order: Optional[str] = "asc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Directorio de miembros con métricas y nivel (Solo ADMIN/ORGANIZADOR)."""
    return auth_service.get_directorio_miembros(
        db=db,
        current_user=current_user,
        search=search,
        q=q,
        rol=rol,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
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

