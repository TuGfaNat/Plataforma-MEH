from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..models import models
from ..schemas import evento as evento_schema
from ..core.logging import registrar_log
from ..core.exceptions import (
    EventoNoEncontradoError,
    PermisoDenegadoError,
    CupoExcedidoError,
    ValidacionNegocioError
)
from ..core.permissions import (
    PERMISSION_ATTENDANCE_SCAN,
    PERMISSION_EVENTS_MANAGE,
    has_permission
)

def create_evento(
    db: Session,
    admin_user: models.Usuario,
    evento_data: evento_schema.EventoCreate,
    ip_address: Optional[str] = None
) -> models.Evento:
    """Crea un nuevo evento en el sistema (Solo Staff autorizado)."""
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para crear eventos")

    data = evento_data.model_dump()
    id_speakers = data.pop("id_speakers", [])
    id_auspiciadores = data.pop("id_auspiciadores", [])
    id_comunidades = data.pop("id_comunidades", [])

    db_evento = models.Evento(
        **data,
        id_organizador=admin_user.id_usuario,
        creado_por=admin_user.id_usuario,
        fecha_creacion=datetime.utcnow()
    )
    
    # Asociar relaciones (Si se proporcionan IDs)
    if id_speakers:
        db_evento.speakers = db.query(models.Speaker).filter(models.Speaker.id_speaker.in_(id_speakers)).all()
    if id_auspiciadores:
        db_evento.auspiciadores = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador.in_(id_auspiciadores)).all()
    if id_comunidades:
        db_evento.comunidades = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad.in_(id_comunidades)).all()

    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="CREAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=db_evento.id_evento,
        valor_nuevo=evento_data.model_dump(),
        ip_direccion=ip_address
    )
    return db_evento

def list_eventos(db: Session, skip: int = 0, limit: int = 100) -> List[models.Evento]:
    """Lista eventos públicos con paginación."""
    return db.query(models.Evento).offset(skip).limit(limit).all()

def get_evento_by_id(db: Session, id_evento: int) -> models.Evento:
    """Obtiene un evento por su ID o lanza error de dominio."""
    db_evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not db_evento:
        raise EventoNoEncontradoError()
    return db_evento

def update_evento(
    db: Session,
    admin_user: models.Usuario,
    id_evento: int,
    evento_update: evento_schema.EventoUpdate,
    ip_address: Optional[str] = None
) -> models.Evento:
    """Actualiza un evento existente (Solo Staff autorizado)."""
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para modificar eventos")
        
    db_evento = get_evento_by_id(db, id_evento)
    valor_anterior = {
        "titulo": db_evento.titulo,
        "estado": db_evento.estado,
        "capacidad_max": db_evento.capacidad_max
    }

    update_data = evento_update.model_dump(exclude_unset=True)
    
    # Manejar relaciones Many-to-Many de forma aislada
    id_speakers = update_data.pop("id_speakers", None)
    id_auspiciadores = update_data.pop("id_auspiciadores", None)
    id_comunidades = update_data.pop("id_comunidades", None)

    for key, value in update_data.items():
        setattr(db_evento, key, value)

    if id_speakers is not None:
        db_evento.speakers = db.query(models.Speaker).filter(models.Speaker.id_speaker.in_(id_speakers)).all()
    if id_auspiciadores is not None:
        db_evento.auspiciadores = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador.in_(id_auspiciadores)).all()
    if id_comunidades is not None:
        db_evento.comunidades = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad.in_(id_comunidades)).all()

    db_evento.modificado_por = admin_user.id_usuario
    db_evento.fecha_modificacion = datetime.utcnow()

    db.commit()
    db.refresh(db_evento)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
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
    staff_user: models.Usuario,
    codigo_qr: str,
    ip_address: Optional[str] = None,
    id_checkpoint: Optional[int] = None
) -> dict:
    """Registra la asistencia física de un miembro mediante escaneo (Solo Staff autorizado)."""
    if not has_permission(staff_user.rol, PERMISSION_ATTENDANCE_SCAN):
        raise PermisoDenegadoError("No tienes permisos para registrar asistencia")

    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.codigo_qr == codigo_qr
    ).first()
    
    if not inscripcion:
        raise ValidacionNegocioError("El código QR no pertenece a ninguna inscripción válida")

    if inscripcion.estado_inscripcion != "CONFIRMADA":
        raise ValidacionNegocioError(f"La inscripción está en estado {inscripcion.estado_inscripcion}. Requiere confirmación de pago.")

    if inscripcion.asistio:
        raise ValidacionNegocioError("Esta entrada ya fue escaneada anteriormente")

    inscripcion.asistio = True
    inscripcion.fecha_validacion = datetime.utcnow()
    inscripcion.modificado_por = staff_user.id_usuario
    inscripcion.fecha_modificacion = datetime.utcnow()
    
    # Obtener info para el log y respuesta
    usuario = inscripcion.usuario
    evento = inscripcion.evento

    registrar_log(
        db=db,
        id_admin=staff_user.id_usuario,
        accion="REGISTRO_ASISTENCIA_QR",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=inscripcion.id_inscripcion,
        valor_nuevo={
            "id_usuario": inscripcion.id_usuario,
            "id_evento": inscripcion.id_evento,
            "nombre_usuario": f"{usuario.nombres} {usuario.apellidos}"
        },
        ip_direccion=ip_address
    )
    
    db.commit()
    return {
        "message": "Asistencia registrada con éxito", 
        "usuario": {"nombre": f"{usuario.nombres} {usuario.apellidos}"},
        "evento": {"titulo": evento.titulo}
    }

def get_checkpoints(db: Session, id_evento: int):
    return db.query(models.Checkpoint).filter(
        models.Checkpoint.id_evento == id_evento,
        models.Checkpoint.activo == True
    ).order_by(models.Checkpoint.orden.asc()).all()

def create_checkpoint(db: Session, admin_user: models.Usuario, id_evento: int, checkpoint_data):
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para crear checkpoints")

    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise ValidacionNegocioError("Evento no encontrado")

    nuevo = models.Checkpoint(
        id_evento=id_evento,
        nombre_checkpoint=checkpoint_data.nombre_checkpoint,
        tipo_checkpoint=checkpoint_data.tipo_checkpoint,
        orden=checkpoint_data.orden
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
