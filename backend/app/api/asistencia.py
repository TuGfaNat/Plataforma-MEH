from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database import get_db
from ..services import asistencia_service
from .auth import get_current_user
from ..models import models

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
    return asistencia_service.registrar_asistencia_universal(db, current_user, tipo, id_actividad, id_usuario)
