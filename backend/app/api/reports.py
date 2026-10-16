import logging
from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..api.auth import get_current_user
from ..core.permissions import PERMISSION_AUDIT_READ, has_permission, ensure_permission
from ..database import get_db
from ..models import models

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger(__name__)


def _month_key(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.strftime("%Y-%m")
    if isinstance(value, str):
        return value[:7]
    return str(value)[:7]


def _safe_value(getter, default=0):
    try:
        value = getter()
        return default if value is None else value
    except Exception as exc:
        logger.warning("reports: query fallback -> %s", exc)
        return default


from typing import Optional

@router.get("/dashboard-stats")
def get_dashboard_stats(
    q: Optional[str] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    fechas: Optional[str] = None,
    modalidad: Optional[str] = None,
    estado: Optional[str] = None,
    id_eventos: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    ensure_permission(current_user.rol, PERMISSION_AUDIT_READ, "No tienes privilegios para consultar reportes estratégicos")
    from ..services import dashboard_service
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
