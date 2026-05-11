from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import models
from ..schemas import anuncio as anuncio_schema
from ..core.logging import registrar_log
from ..core.permissions import PERMISSION_ANNOUNCEMENTS_MANAGE, ensure_permission


def list_miembros_publicos(db: Session) -> List[models.Usuario]:
    return db.query(models.Usuario).filter(models.Usuario.perfil_publico == True).all()


def list_anuncios_activos(db: Session) -> List[models.Anuncio]:
    return db.query(models.Anuncio).filter(models.Anuncio.activo == True).order_by(models.Anuncio.fecha_publicacion.desc()).all()


def create_anuncio(
    db: Session,
    current_user: models.Usuario,
    anuncio: anuncio_schema.AnuncioCreate,
    ip_address: Optional[str]
) -> models.Anuncio:
    ensure_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE, "No tienes permisos para publicar anuncios")

    db_anuncio = models.Anuncio(
        **anuncio.model_dump(), 
        id_autor=current_user.id_usuario,
        creado_por=current_user.id_usuario # MIXIN
    )
    db.add(db_anuncio)
    db.commit()
    db.refresh(db_anuncio)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_ANUNCIO",
        tabla_afectada="anuncios",
        id_registro_afectado=db_anuncio.id_anuncio,
        valor_nuevo=anuncio.model_dump(),
        ip_direccion=ip_address
    )
    return db_anuncio
