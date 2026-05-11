from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import anuncio as anuncio_schema
from ..schemas import user as user_schema
from ..services import comunidad_service
from .auth import get_current_user

router = APIRouter(
    prefix="/comunidad",
    tags=["comunidad"]
)

@router.get("/miembros", response_model=List[user_schema.UserResponse])
def get_miembros_publicos(db: Session = Depends(get_db)):
    return comunidad_service.list_miembros_publicos(db)

@router.get("/anuncios", response_model=List[anuncio_schema.AnuncioResponse])
def get_anuncios(db: Session = Depends(get_db)):
    return comunidad_service.list_anuncios_activos(db)

@router.post("/anuncios", response_model=anuncio_schema.AnuncioResponse)
def create_anuncio(
    request: Request,
    anuncio: anuncio_schema.AnuncioCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return comunidad_service.create_anuncio(db, current_user, anuncio, ip_address)
