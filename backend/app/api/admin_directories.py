from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import user as user_schema
from .auth import get_current_user
from ..core.permissions import ensure_permission, PERMISSION_EVENTS_MANAGE

router = APIRouter(
    prefix="/admin-directories",
    tags=["admin-directories"]
)

@router.get("/speakers")
def get_speakers(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return db.query(models.Speaker).all()

@router.post("/speakers")
def create_speaker(
    speaker_data: dict, # Simplificado para el ejemplo, idealmente usar schemas
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    db_speaker = models.Speaker(**speaker_data)
    db.add(db_speaker)
    db.commit()
    db.refresh(db_speaker)
    return db_speaker

@router.get("/auspiciadores")
def get_auspiciadores(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return db.query(models.Auspiciador).all()

@router.post("/auspiciadores")
def create_auspiciador(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    db_obj = models.Auspiciador(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/comunidades")
def get_comunidades(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return db.query(models.ComunidadAliada).all()

@router.post("/comunidades")
def create_comunidad(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    db_obj = models.ComunidadAliada(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
