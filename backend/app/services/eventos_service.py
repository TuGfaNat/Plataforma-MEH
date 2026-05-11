from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import models
from ..schemas import evento as evento_schema
from ..core.logging import registrar_log
from ..core.permissions import (
    PERMISSION_ATTENDANCE_SCAN,
    PERMISSION_EVENTS_MANAGE,
    ensure_permission,
)


def create_evento(
    db: Session,
    current_user: models.Usuario,
    evento: evento_schema.EventoCreate,
    ip_address: Optional[str]
) -> models.Evento:
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para crear eventos")

    db_evento = models.Evento(
        **evento.model_dump(),
        id_organizador=current_user.id_usuario,
        creado_por=current_user.id_usuario # MIXIN
    )
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=db_evento.id_evento,
        valor_nuevo=evento.model_dump(),
        ip_direccion=ip_address
    )
    return db_evento


def list_eventos(db: Session, skip: int = 0, limit: int = 100) -> List[models.Evento]:
    return db.query(models.Evento).offset(skip).limit(limit).all()


def get_evento(db: Session, id_evento: int) -> models.Evento:
    db_evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return db_evento


def update_evento(
    db: Session,
    current_user: models.Usuario,
    id_evento: int,
    evento_update: evento_schema.EventoUpdate,
    ip_address: Optional[str]
) -> models.Evento:
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para modificar eventos")
    db_evento = get_evento(db, id_evento)

    valor_anterior = {
        "titulo": db_evento.titulo,
        "estado": db_evento.estado,
        "capacidad_max": db_evento.capacidad_max
    }

    update_data = evento_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_evento, key, value)

    # AUDITORIA MIXIN
    db_evento.modificado_por = current_user.id_usuario
    db_evento.fecha_modificacion = datetime.utcnow()

    db.commit()
    db.refresh(db_evento)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ACTUALIZAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_anterior=valor_anterior,
        valor_nuevo=update_data,
        ip_direccion=ip_address
    )
    return db_evento


def registrar_asistencia_qr(
    db: Session,
    current_user: models.Usuario,
    id_evento: int,
    token_qr: str,
    id_usuario: int
) -> dict:
    ensure_permission(current_user.rol, PERMISSION_ATTENDANCE_SCAN, "No tienes permisos para registrar asistencia")

    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento or evento.token_qr != token_qr:
        raise HTTPException(status_code=400, detail="Token QR inválido para este evento")

    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == id_usuario,
        models.InscripcionEvento.id_evento == id_evento
    ).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="El usuario no está inscrito en este evento")

    inscripcion.asistio = True
    inscripcion.fecha_validacion = datetime.utcnow()
    
    # EMITIR CERTIFICADO DE ASISTENCIA
    nuevo_cert = models.Certificado(
        id_usuario=id_usuario,
        id_evento=id_evento,
        codigo_verificacion=f"MEH-EVE-{id_usuario}-{id_evento}-{datetime.utcnow().strftime('%Y%m%d')}",
        url_pdf=evento.plantilla_certificado_url or "https://ejemplo.com/default-event-cert.pdf",
        fecha_emision=datetime.utcnow(),
        creado_por=current_user.id_usuario
    )
    db.add(nuevo_cert)
    
    # NOTIFICACION EMAIL
    from . import email_service
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    email_service.notify_nuevo_certificado(usuario.correo, usuario.nombres, evento.titulo)

    # AUDITORIA MIXIN
    inscripcion.modificado_por = current_user.id_usuario
    inscripcion.fecha_modificacion = datetime.utcnow()

    db.commit()
    return {"message": "Asistencia registrada con éxito", "usuario": id_usuario}
