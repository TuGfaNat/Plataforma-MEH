from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import models
from ..schemas import anuncio as anuncio_schema
from ..core.logging import registrar_log
from ..core.permissions import PERMISSION_ANNOUNCEMENTS_MANAGE, ensure_permission
from .email_service import notify_nuevo_anuncio


def list_miembros_publicos(db: Session) -> List[models.Usuario]:
    return db.query(models.Usuario).filter(models.Usuario.perfil_publico == True).all()


def get_perfil_publico(db: Session, id_usuario: int) -> Optional[models.Usuario]:
    return db.query(models.Usuario).filter(
        models.Usuario.id_usuario == id_usuario,
        models.Usuario.perfil_publico == True
    ).first()


def list_anuncios_activos(db: Session) -> List[models.Anuncio]:
    return db.query(models.Anuncio).filter(models.Anuncio.activo == True).order_by(models.Anuncio.fecha_publicacion.desc()).all()


def list_all_anuncios(db: Session, current_user: models.Usuario) -> List[models.Anuncio]:
    ensure_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE, "No tienes permisos")
    return db.query(models.Anuncio).order_by(models.Anuncio.fecha_publicacion.desc()).all()


def create_anuncio(
    db: Session,
    current_user: models.Usuario,
    anuncio: anuncio_schema.AnuncioCreate,
    ip_address: Optional[str]
) -> models.Anuncio:
    ensure_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE, "No tienes permisos para publicar anuncios")

    anuncio_data = anuncio.model_dump()
    enviar_email = anuncio_data.pop("enviar_email", False)

    db_anuncio = models.Anuncio(
        **anuncio_data, 
        id_autor=current_user.id_usuario,
        creado_por=current_user.id_usuario # MIXIN
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

    # Envío de correos si se solicita
    if enviar_email:
        miembros = db.query(models.Usuario).filter(models.Usuario.activo == True).all()
        for miembro in miembros:
            try:
                notify_nuevo_anuncio(
                    email=miembro.correo,
                    nombre=f"{miembro.nombres} {miembro.apellidos}",
                    titulo_anuncio=db_anuncio.titulo,
                    contenido_anuncio=db_anuncio.contenido
                )
            except Exception as e:
                print(f"Fallo al notificar a {miembro.correo}: {str(e)}")

    return db_anuncio


def update_anuncio(
    db: Session,
    id_anuncio: int,
    anuncio_update: anuncio_schema.AnuncioUpdate,
    current_user: models.Usuario,
    ip_address: Optional[str]
) -> models.Anuncio:
    ensure_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE, "No tienes permisos")

    db_anuncio = db.query(models.Anuncio).filter(models.Anuncio.id_anuncio == id_anuncio).first()
    if not db_anuncio:
        return None
    
    old_data = {
        "titulo": db_anuncio.titulo,
        "contenido": db_anuncio.contenido,
        "activo": db_anuncio.activo
    }

    for key, value in anuncio_update.model_dump(exclude_unset=True).items():
        setattr(db_anuncio, key, value)
    
    db_anuncio.modificado_por = current_user.id_usuario
    db_anuncio.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    db.refresh(db_anuncio)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ACTUALIZAR_ANUNCIO",
        tabla_afectada="anuncios",
        id_registro_afectado=id_anuncio,
        valor_anterior=old_data,
        valor_nuevo=anuncio_update.model_dump(exclude_unset=True),
        ip_direccion=ip_address
    )
    
    return db_anuncio


def delete_anuncio(db: Session, id_anuncio: int, current_user: models.Usuario) -> bool:
    ensure_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE, "No tienes permisos")
    
    db_anuncio = db.query(models.Anuncio).filter(models.Anuncio.id_anuncio == id_anuncio).first()
    if not db_anuncio:
        return False
    
    db.delete(db_anuncio)
    db.commit()
    return True
