from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import models
from ..schemas import anuncio as anuncio_schema
from ..core.logging import registrar_log
from ..core.permissions import PERMISSION_ANNOUNCEMENTS_MANAGE, has_permission
from ..core.exceptions import (
    RecursoNoEncontradoError,
    PermisoDenegadoError,
    ValidacionNegocioError
)

def list_miembros_publicos(db: Session) -> List[models.Usuario]:
    """Lista usuarios que tienen habilitado el perfil público."""
    return db.query(models.Usuario).filter(models.Usuario.perfil_publico == True).all()

def get_perfil_publico(db: Session, id_usuario: int) -> models.Usuario:
    """Obtiene los datos de un perfil público específico."""
    perfil = db.query(models.Usuario).filter(
        models.Usuario.id_usuario == id_usuario,
        models.Usuario.perfil_publico == True
    ).first()
    if not perfil:
        raise RecursoNoEncontradoError("Perfil no encontrado o privado")
    return perfil

def list_anuncios_activos(db: Session) -> List[models.Anuncio]:
    """Lista anuncios para la comunidad (solo activos)."""
    return db.query(models.Anuncio).filter(
        models.Anuncio.activo == True
    ).order_by(models.Anuncio.fecha_publicacion.desc()).all()

def list_all_anuncios(db: Session, role: str) -> List[models.Anuncio]:
    """Lista todos los anuncios incluyendo inactivos (Solo Staff)."""
    if not has_permission(role, PERMISSION_ANNOUNCEMENTS_MANAGE):
        raise PermisoDenegadoError()
    return db.query(models.Anuncio).order_by(models.Anuncio.fecha_publicacion.desc()).all()

def create_anuncio(
    db: Session,
    current_user: models.Usuario,
    anuncio: anuncio_schema.AnuncioCreate,
    ip_address: Optional[str] = None
) -> models.Anuncio:
    """Crea un nuevo anuncio y opcionalmente notifica por email (Solo Staff)."""
    if not has_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para publicar anuncios")

    anuncio_data = anuncio.model_dump()
    enviar_email = anuncio_data.pop("enviar_email", False)

    db_anuncio = models.Anuncio(
        **anuncio_data, 
        id_autor=current_user.id_usuario
    )
    db.add(db_anuncio)
    db.commit()
    db.refresh(db_anuncio)

    # Registro en auditoría
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_ANUNCIO",
        tabla_afectada="anuncios",
        id_registro_afectado=db_anuncio.id_anuncio,
        valor_nuevo=anuncio_data,
        ip_direccion=ip_address
    )

    # Notificaciones (Manejadas con precaución)
    if enviar_email:
        try:
            from .email_service import notify_nuevo_anuncio
            miembros = db.query(models.Usuario).filter(models.Usuario.activo == True).all()
            for miembro in miembros:
                try:
                    notify_nuevo_anuncio(
                        email=miembro.correo,
                        nombre=f"{miembro.nombres} {miembro.apellidos}",
                        titulo_anuncio=db_anuncio.titulo,
                        contenido_anuncio=db_anuncio.contenido
                    )
                except Exception:
                    pass
        except Exception:
            pass

    return db_anuncio

def update_anuncio(
    db: Session,
    id_anuncio: int,
    anuncio_update: anuncio_schema.AnuncioUpdate,
    admin_user: models.Usuario,
    ip_address: Optional[str] = None
) -> models.Anuncio:
    """Actualiza un anuncio existente (Solo Staff)."""
    if not has_permission(admin_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE):
        raise PermisoDenegadoError()

    db_anuncio = db.query(models.Anuncio).filter(models.Anuncio.id_anuncio == id_anuncio).first()
    if not db_anuncio:
        raise RecursoNoEncontradoError("Anuncio no encontrado")
    
    old_data = {
        "titulo": db_anuncio.titulo,
        "contenido": db_anuncio.contenido,
        "activo": db_anuncio.activo
    }

    update_data = anuncio_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_anuncio, key, value)
    
    db.commit()
    db.refresh(db_anuncio)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="ACTUALIZAR_ANUNCIO",
        tabla_afectada="anuncios",
        id_registro_afectado=id_anuncio,
        valor_anterior=old_data,
        valor_nuevo=update_data,
        ip_direccion=ip_address
    )
    
    return db_anuncio

def delete_anuncio(db: Session, id_anuncio: int, admin_user: models.Usuario) -> None:
    """Elimina permanentemente un anuncio (Solo Staff)."""
    if not has_permission(admin_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE):
        raise PermisoDenegadoError()
    
    db_anuncio = db.query(models.Anuncio).filter(models.Anuncio.id_anuncio == id_anuncio).first()
    if not db_anuncio:
        raise RecursoNoEncontradoError("Anuncio no encontrado")
    
    db_anuncio.id_estado = 0
    db.commit()

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="BORRAR_ANUNCIO",
        tabla_afectada="anuncios",
        id_registro_afectado=id_anuncio
    )
