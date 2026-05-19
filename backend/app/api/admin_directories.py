from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import ecosistema as schema
from ..services import ecosistema_service
from .auth import get_current_user

router = APIRouter(
    prefix="/admin-directories",
    tags=["admin-directories"]
)

# --- SPEAKERS ---
@router.get("/speakers", response_model=List[schema.SpeakerResponse])
def get_speakers(db: Session = Depends(get_db)):
    return ecosistema_service.list_speakers(db)

@router.post("/speakers", response_model=schema.SpeakerResponse, status_code=status.HTTP_201_CREATED)
def create_speaker(
    request: Request,
    data: schema.SpeakerCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return ecosistema_service.create_speaker(db, current_user, data, ip)

@router.put("/speakers/{id_speaker}", response_model=schema.SpeakerResponse)
def update_speaker(
    id_speaker: int,
    request: Request,
    data: schema.SpeakerUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return ecosistema_service.update_speaker(db, id_speaker, current_user, data, ip)

@router.delete("/speakers/{id_speaker}", status_code=status.HTTP_204_NO_CONTENT)
def delete_speaker(
    id_speaker: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ecosistema_service.delete_speaker(db, id_speaker, current_user)
    return None

# --- AUSPICIADORES ---
@router.get("/auspiciadores", response_model=List[schema.AuspiciadorResponse])
def get_auspiciadores(db: Session = Depends(get_db)):
    return ecosistema_service.list_auspiciadores(db)

@router.post("/auspiciadores", response_model=schema.AuspiciadorResponse, status_code=status.HTTP_201_CREATED)
def create_auspiciador(
    request: Request,
    data: schema.AuspiciadorCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return ecosistema_service.create_auspiciador(db, current_user, data, ip)

@router.put("/auspiciadores/{id_auspiciador}", response_model=schema.AuspiciadorResponse)
def update_auspiciador(
    id_auspiciador: int,
    request: Request,
    data: schema.AuspiciadorUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return ecosistema_service.update_auspiciador(db, id_auspiciador, current_user, data, ip)

@router.delete("/auspiciadores/{id_auspiciador}", status_code=status.HTTP_204_NO_CONTENT)
def delete_auspiciador(
    id_auspiciador: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ecosistema_service.delete_auspiciador(db, id_auspiciador, current_user)
    return None

# --- COMUNIDADES ---
@router.get("/comunidades", response_model=List[schema.ComunidadResponse])
def get_comunidades(db: Session = Depends(get_db)):
    return ecosistema_service.list_comunidades(db)

@router.post("/comunidades", response_model=schema.ComunidadResponse, status_code=status.HTTP_201_CREATED)
def create_comunidad(
    request: Request,
    data: schema.ComunidadCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return ecosistema_service.create_comunidad(db, current_user, data, ip)

@router.put("/comunidades/{id_comunidad}", response_model=schema.ComunidadResponse)
def update_comunidad(
    id_comunidad: int,
    request: Request,
    data: schema.ComunidadUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return ecosistema_service.update_comunidad(db, id_comunidad, current_user, data, ip)

@router.delete("/comunidades/{id_comunidad}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comunidad(
    id_comunidad: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ecosistema_service.delete_comunidad(db, id_comunidad, current_user)
    return None
