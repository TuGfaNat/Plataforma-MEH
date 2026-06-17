from fastapi import APIRouter, Depends, Request, status
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
    """Lista todos los perfiles marcados como públicos."""
    return comunidad_service.list_miembros_publicos(db)

@router.get("/miembros/{id_usuario}", response_model=user_schema.UserProfileResponse)
def get_miembro_detalle(id_usuario: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de un perfil público."""
    return comunidad_service.get_perfil_publico(db, id_usuario)

@router.get("/anuncios", response_model=List[anuncio_schema.AnuncioResponse])
def get_anuncios(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Muestra los anuncios activos para la comunidad."""
    return comunidad_service.list_anuncios_activos(db, current_user)

@router.get("/anuncios/all", response_model=List[anuncio_schema.AnuncioResponse])
def get_all_anuncios(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Lista todos los anuncios (incluyendo inactivos) para gestión (Solo Staff)."""
    return comunidad_service.list_all_anuncios(db, current_user.rol)

@router.post("/anuncios", response_model=anuncio_schema.AnuncioResponse, status_code=status.HTTP_201_CREATED)
def create_anuncio(
    request: Request,
    anuncio: anuncio_schema.AnuncioCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Crea y publica un nuevo anuncio."""
    ip_address = request.client.host if request.client else None
    return comunidad_service.create_anuncio(db, current_user, anuncio, ip_address)

@router.put("/anuncios/{id_anuncio}", response_model=anuncio_schema.AnuncioResponse)
def update_anuncio(
    id_anuncio: int,
    request: Request,
    anuncio: anuncio_schema.AnuncioUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza un anuncio existente."""
    ip_address = request.client.host if request.client else None
    return comunidad_service.update_anuncio(db, id_anuncio, anuncio, current_user, ip_address)

@router.delete("/anuncios/{id_anuncio}", status_code=status.HTTP_204_NO_CONTENT)
def delete_anuncio(
    id_anuncio: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Elimina permanentemente un anuncio."""
    comunidad_service.delete_anuncio(db, id_anuncio, current_user)
    return None
