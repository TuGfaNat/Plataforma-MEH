from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import anuncio as anuncio_schema
from ..schemas import user as user_schema
from ..core.logging import registrar_log
from .auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/comunidad",
    tags=["comunidad"]
)

@router.get("/miembros", response_model=List[user_schema.UserResponse])
def get_miembros_publicos(db: Session = Depends(get_db)):
    # Solo usuarios que tengan perfil_publico = True
    return db.query(models.Usuario).filter(models.Usuario.perfil_publico == True).all()

@router.get("/anuncios", response_model=List[anuncio_schema.AnuncioResponse])
def get_anuncios(db: Session = Depends(get_db)):
    return db.query(models.Anuncio).filter(models.Anuncio.activo == True).order_by(models.Anuncio.fecha_publicacion.desc()).all()

@router.post("/anuncios", response_model=anuncio_schema.AnuncioResponse)
def create_anuncio(
    request: Request,
    anuncio: anuncio_schema.AnuncioCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para publicar anuncios")
    
    db_anuncio = models.Anuncio(**anuncio.model_dump(), id_autor=current_user.id_usuario)
    db.add(db_anuncio)
    db.commit()
    db.refresh(db_anuncio)
    
    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_ANUNCIO",
        tabla_afectada="anuncios",
        id_registro_afectado=db_anuncio.id_anuncio,
        valor_nuevo=anuncio.model_dump(),
        ip_direccion=request.client.host
    )
    
    return db_anuncio
