from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database import get_db
from ..services import asistencia_service, eventos_service
from .auth import get_current_user
from ..models import models
from ..schemas.checkpoint import AsistenciaDeshacerRequest, AsistenciaDeshacerResponse
from ..core.exceptions import ValidacionNegocioError

router = APIRouter(prefix="/asistencia", tags=["asistencia"])

@router.get("/actividades")
def get_actividades(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return asistencia_service.get_actividades_activas(db)

@router.post("/registrar")
def registrar(
    tipo: str,
    id_actividad: int,
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if id_usuario == current_user.id_usuario:
        raise ValidacionNegocioError("No está permitido auto-escanear o registrar tu propia asistencia")
    return asistencia_service.registrar_asistencia_universal(db, current_user, tipo, id_actividad, id_usuario)

@router.post("/deshacer", response_model=AsistenciaDeshacerResponse)
def deshacer_asistencia(
    request: Request,
    payload: AsistenciaDeshacerRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Deshace un escaneo accidental dentro de una ventana de 30 segundos (Admin sin límite) con auditoría (MEH-018)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.deshacer_asistencia_qr(db, current_user, payload, ip_address)
