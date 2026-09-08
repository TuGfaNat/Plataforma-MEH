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

def list_anuncios_activos(
    db: Session, 
    current_user: models.Usuario,
    id_evento: Optional[int] = None,
    categoria: Optional[str] = None
) -> List[models.Anuncio]:
    """Lista anuncios activos para la comunidad, aplicando segmentación por rol, categorías y eventos."""
    query = db.query(models.Anuncio).filter(models.Anuncio.activo == True)
    
    if id_evento:
        query = query.filter(models.Anuncio.id_evento == id_evento)

    if categoria and categoria.strip().upper() not in ["TODAS", "ALL", ""]:
        query = query.filter(models.Anuncio.categoria == categoria.strip().upper())

    anuncios = query.order_by(models.Anuncio.fecha_publicacion.desc()).all()

    # Si es ADMIN, tiene visibilidad completa para supervisión
    if current_user.rol == 'ADMIN':
        return anuncios

    roles_privilegiados = {'ADMIN', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'EMBAJADOR'}
    
    # Obtener IDs de eventos en los que el usuario está inscrito activamente
    eventos_inscritos_ids = set()
    inscripciones = db.query(models.InscripcionEvento.id_evento).filter(
        models.InscripcionEvento.id_usuario == current_user.id_usuario,
        models.InscripcionEvento.id_estado != 0,
        models.InscripcionEvento.estado_inscripcion.in_(["CONFIRMADA", "PENDIENTE", "PENDIENTE_APROBACION"])
    ).all()
    for row in inscripciones:
        eventos_inscritos_ids.add(row[0])

    anuncios_visibles = []
    for an in anuncios:
        # 1. Filtro legacy de embajadores
        if an.exclusivo_embajadores and current_user.rol not in roles_privilegiados:
            continue

        # 2. Filtro de roles objetivo (roles_destino)
        if an.roles_destino and an.roles_destino.strip().upper() != "TODOS":
            target_roles = {r.strip().upper() for r in an.roles_destino.split(",") if r.strip()}
            if current_user.rol.upper() not in target_roles:
                continue

        # 3. Filtro de evento (solo_inscritos_evento)
        if an.id_evento and an.solo_inscritos_evento:
            if current_user.rol not in {'ADMIN', 'ORGANIZADOR'} and an.id_evento not in eventos_inscritos_ids:
                continue

        anuncios_visibles.append(an)

    return anuncios_visibles

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
    """Crea un nuevo anuncio y opcionalmente notifica por email a la audiencia segmentada (Solo Staff)."""
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

    # Notificaciones segmentadas por email
    if enviar_email:
        try:
            from .email_service import notify_nuevo_anuncio
            query_miembros = db.query(models.Usuario).filter(models.Usuario.activo == True)

            # Segmentar por rol
            if db_anuncio.roles_destino and db_anuncio.roles_destino.strip().upper() != "TODOS":
                target_roles = [r.strip().upper() for r in db_anuncio.roles_destino.split(",") if r.strip()]
                query_miembros = query_miembros.filter(models.Usuario.rol.in_(target_roles))
            elif db_anuncio.exclusivo_embajadores:
                query_miembros = query_miembros.filter(models.Usuario.rol.in_(['EMBAJADOR', 'ORGANIZADOR', 'ADMIN']))

            # Segmentar si es exclusivo para inscritos en un evento
            if db_anuncio.id_evento and db_anuncio.solo_inscritos_evento:
                inscritos_ids = db.query(models.InscripcionEvento.id_usuario).filter(
                    models.InscripcionEvento.id_evento == db_anuncio.id_evento,
                    models.InscripcionEvento.id_estado != 0,
                    models.InscripcionEvento.estado_inscripcion.in_(["CONFIRMADA", "PENDIENTE", "PENDIENTE_APROBACION"])
                ).subquery()
                query_miembros = query_miembros.filter(models.Usuario.id_usuario.in_(inscritos_ids))

            miembros = query_miembros.all()
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
