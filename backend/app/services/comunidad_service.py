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
    query = db.query(models.Anuncio).filter(
        models.Anuncio.activo == True,
        models.Anuncio.id_estado != 0
    )
    
    if id_evento:
        query = query.filter(models.Anuncio.id_evento == id_evento)

    if categoria and categoria.strip().upper() not in ["TODAS", "ALL", ""]:
        query = query.filter(models.Anuncio.categoria == categoria.strip().upper())

    anuncios = query.order_by(models.Anuncio.fecha_publicacion.desc()).all()

    # Si es ADMIN, tiene visibilidad completa para supervisión
    if current_user.rol == 'ADMIN':
        for an in anuncios:
            _hydrate_anuncio_evento(an)
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

        _hydrate_anuncio_evento(an)
        anuncios_visibles.append(an)

    return anuncios_visibles


def _hydrate_anuncio_evento(an: models.Anuncio) -> None:
    """Enriquece el anuncio con metadatos e imagen 16:9 del evento vinculado si existe."""
    ev = getattr(an, "evento", None)
    if ev is not None:
        from .evento_imagen_service import resolve_evento_imagen_variantes

        variantes = resolve_evento_imagen_variantes(ev.imagen_url)
        an.evento_imagen_url = ev.imagen_url
        an.evento_imagen_16x9 = variantes.get("widescreen_16x9")
        an.evento_fecha = ev.fecha_inicio.isoformat() if ev.fecha_inicio else None


def _get_segmented_miembros_for_anuncio(
    db: Session,
    roles_destino: Optional[str],
    exclusivo_embajadores: bool,
    id_evento: Optional[int],
    solo_inscritos_evento: bool,
) -> List[models.Usuario]:
    """Aplica los filtros de audiencia de un anuncio sobre usuarios activos."""
    query_miembros = db.query(models.Usuario).filter(models.Usuario.activo == True)

    if roles_destino and roles_destino.strip().upper() != "TODOS":
        target_roles = [r.strip().upper() for r in roles_destino.split(",") if r.strip()]
        query_miembros = query_miembros.filter(models.Usuario.rol.in_(target_roles))
    elif exclusivo_embajadores:
        query_miembros = query_miembros.filter(models.Usuario.rol.in_(['EMBAJADOR', 'ORGANIZADOR', 'ADMIN']))

    if id_evento and solo_inscritos_evento:
        inscritos_ids = db.query(models.InscripcionEvento.id_usuario).filter(
            models.InscripcionEvento.id_evento == id_evento,
            models.InscripcionEvento.id_estado != 0,
            models.InscripcionEvento.estado_inscripcion.in_(["CONFIRMADA", "PENDIENTE", "PENDIENTE_APROBACION"])
        ).subquery()
        query_miembros = query_miembros.filter(models.Usuario.id_usuario.in_(inscritos_ids))

    return query_miembros.all()


def simulate_anuncio_dry_run(
    db: Session,
    current_user: models.Usuario,
    anuncio: anuncio_schema.AnuncioCreate,
) -> dict:
    """Simula el envío de correo de un anuncio aplicando filtros reales sin persistir ni enviar por SMTP."""
    if not has_permission(current_user.rol, PERMISSION_ANNOUNCEMENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para simular anuncios")

    evento_vinculado = None
    if anuncio.id_evento:
        evento_vinculado = db.query(models.Evento).filter(models.Evento.id_evento == anuncio.id_evento).first()

    miembros = _get_segmented_miembros_for_anuncio(
        db=db,
        roles_destino=anuncio.roles_destino,
        exclusivo_embajadores=bool(anuncio.exclusivo_embajadores),
        id_evento=anuncio.id_evento,
        solo_inscritos_evento=bool(anuncio.solo_inscritos_evento),
    )

    destinatarios_preview = [
        {
            "id_usuario": m.id_usuario,
            "nombre": f"{m.nombres or ''} {m.apellidos or ''}".strip(),
            "correo": m.correo,
            "rol": m.rol,
        }
        for m in miembros
        if m.correo
    ]

    from . import email_service

    ejemplo_nombre = destinatarios_preview[0]["nombre"] if destinatarios_preview else "Miembro MEH"
    subject_preview, html_preview, _, header_meta = email_service.render_nuevo_anuncio_email(
        nombre=ejemplo_nombre,
        titulo_anuncio=anuncio.titulo,
        contenido_anuncio=anuncio.contenido,
        evento=evento_vinculado,
        for_preview=True,
    )

    return {
        "status": "dry_run",
        "dry_run": True,
        "message": f"Simulación (dry-run) completada: {len(destinatarios_preview)} destinatarios coinciden con los filtros (sin envío SMTP real).",
        "total_destinatarios": len(destinatarios_preview),
        "destinatarios_preview": destinatarios_preview[:50],
        "filtros_aplicados": {
            "roles_destino": anuncio.roles_destino or "TODOS",
            "exclusivo_embajadores": bool(anuncio.exclusivo_embajadores),
            "id_evento": anuncio.id_evento,
            "solo_inscritos_evento": bool(anuncio.solo_inscritos_evento),
        },
        "asunto_renderizado": subject_preview,
        "tiene_imagen_portada": bool(header_meta and header_meta.get("tiene_imagen_portada")),
        "evento_cabecera": header_meta,
        "html_preview": html_preview,
    }


def list_all_anuncios(db: Session, role: str) -> List[models.Anuncio]:
    """Lista todos los anuncios incluyendo inactivos (Solo Staff), excluyendo eliminados (id_estado=0)."""
    if not has_permission(role, PERMISSION_ANNOUNCEMENTS_MANAGE):
        raise PermisoDenegadoError()
    rows = db.query(models.Anuncio).filter(
        models.Anuncio.id_estado != 0
    ).order_by(models.Anuncio.fecha_publicacion.desc()).all()
    for an in rows:
        _hydrate_anuncio_evento(an)
    return rows

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
    anuncio_data.pop("dry_run", False)

    db_anuncio = models.Anuncio(
        **anuncio_data, 
        id_autor=current_user.id_usuario
    )
    db.add(db_anuncio)
    db.commit()
    db.refresh(db_anuncio)
    _hydrate_anuncio_evento(db_anuncio)

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
            from . import email_service
            evento_vinculado = db_anuncio.evento
            if evento_vinculado is None and db_anuncio.id_evento:
                evento_vinculado = db.query(models.Evento).filter(
                    models.Evento.id_evento == db_anuncio.id_evento
                ).first()

            miembros = _get_segmented_miembros_for_anuncio(
                db=db,
                roles_destino=db_anuncio.roles_destino,
                exclusivo_embajadores=bool(db_anuncio.exclusivo_embajadores),
                id_evento=db_anuncio.id_evento,
                solo_inscritos_evento=bool(db_anuncio.solo_inscritos_evento),
            )
            for miembro in miembros:
                try:
                    email_service.call_notify_with_event_context(
                        email_service.notify_nuevo_anuncio,
                        evento_vinculado,
                        {
                            "email": miembro.correo,
                            "nombre": f"{miembro.nombres} {miembro.apellidos}",
                            "titulo_anuncio": db_anuncio.titulo,
                            "contenido_anuncio": db_anuncio.contenido,
                        },
                        {
                            "evento": evento_vinculado,
                            "titulo_evento": evento_vinculado.titulo if evento_vinculado else None,
                            "fecha_evento": evento_vinculado.fecha_inicio if evento_vinculado else None,
                            "imagen_url": evento_vinculado.imagen_url if evento_vinculado else None,
                        } if evento_vinculado else None,
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
