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
        id_organizador=admin_user.id_usuario
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
    """Lista eventos públicos con paginación y actualiza estados de eventos pasados."""
    now = datetime.utcnow()
    # Traer todos los eventos programados o en curso que ya hayan iniciado
    eventos_pasados = db.query(models.Evento).filter(
        models.Evento.estado.in_(["PROGRAMADO", "EN_CURSO"]),
        models.Evento.fecha_inicio < now
    ).all()

    modificado = False
    for ev in eventos_pasados:
        # Si tiene fecha de fin y ya pasó, o si no tiene y han transcurrido más de 24 horas del inicio
        if (ev.fecha_fin and ev.fecha_fin < now) or (not ev.fecha_fin and (now - ev.fecha_inicio).total_seconds() > 86400):
            ev.estado = "FINALIZADO"
            modificado = True

    if modificado:
        db.commit()

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

    checkpoint = None
    if id_checkpoint is not None:
        checkpoint = db.query(models.Checkpoint).filter(
            models.Checkpoint.id_checkpoint == id_checkpoint,
            models.Checkpoint.activo == True
        ).first()
        if not checkpoint:
            raise ValidacionNegocioError("El checkpoint seleccionado no existe o está inactivo")
        
        if checkpoint.id_evento != inscripcion.id_evento:
            raise ValidacionNegocioError("El checkpoint seleccionado no pertenece a este evento")
            
        # Evitar doble escaneo para el mismo checkpoint
        asistencia_existente = db.query(models.AsistenciaDetalle).filter(
            models.AsistenciaDetalle.id_inscripcion == inscripcion.id_inscripcion,
            models.AsistenciaDetalle.id_checkpoint == id_checkpoint
        ).first()
        if asistencia_existente:
            raise ValidacionNegocioError(f"Ya se registró asistencia en el checkpoint '{checkpoint.nombre_checkpoint}' para este miembro.")
            
        # Registrar detalle físico de la asistencia al checkpoint
        nueva_asistencia = models.AsistenciaDetalle(
            id_inscripcion=inscripcion.id_inscripcion,
            id_checkpoint=id_checkpoint,
            fecha_escaneo=datetime.utcnow(),
            escaneado_por=staff_user.id_usuario,
            id_estado=2
        )
        db.add(nueva_asistencia)
        
        # Marcar asistencia general al evento si no está marcada
        if not inscripcion.asistio:
            inscripcion.asistio = True
            inscripcion.fecha_validacion = datetime.utcnow()
    else:
        # Entrada General
        if inscripcion.asistio:
            raise ValidacionNegocioError("Esta entrada ya fue escaneada anteriormente")
            
        inscripcion.asistio = True
        inscripcion.fecha_validacion = datetime.utcnow()

    # Obtener info para el log y respuesta
    usuario = inscripcion.usuario
    evento = inscripcion.evento

    # Definir valores de log adaptados
    log_accion = "REGISTRO_ASISTENCIA_QR"
    log_tabla = "inscripciones_eventos"
    log_id_afectado = inscripcion.id_inscripcion
    log_valor_nuevo = {
        "id_usuario": inscripcion.id_usuario,
        "id_evento": inscripcion.id_evento,
        "nombre_usuario": f"{usuario.nombres} {usuario.apellidos}"
    }

    if checkpoint:
        log_accion = "REGISTRO_ASISTENCIA_CHECKPOINT"
        log_tabla = "asistencia_detalles"
        log_id_afectado = nueva_asistencia.id_asistencia if 'nueva_asistencia' in locals() else None
        log_valor_nuevo["id_checkpoint"] = id_checkpoint
        log_valor_nuevo["nombre_checkpoint"] = checkpoint.nombre_checkpoint

    registrar_log(
        db=db,
        id_admin=staff_user.id_usuario,
        accion=log_accion,
        tabla_afectada=log_tabla,
        id_registro_afectado=log_id_afectado,
        valor_nuevo=log_valor_nuevo,
        ip_direccion=ip_address
    )
    
    db.commit()
    
    # Combinar título del evento con checkpoint para una visualización premium en el frontend
    ret_evento_titulo = evento.titulo
    if checkpoint:
        ret_evento_titulo = f"{evento.titulo} - Checkpoint: {checkpoint.nombre_checkpoint}"

    return {
        "message": "Asistencia registrada con éxito", 
        "usuario": {"nombre": f"{usuario.nombres} {usuario.apellidos}"},
        "evento": {"titulo": ret_evento_titulo}
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

def delete_evento(db: Session, id_evento: int, admin_user: models.Usuario, ip_address: Optional[str] = None):
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para eliminar eventos")
    db_evento = get_evento_by_id(db, id_evento)
    db_evento.id_estado = 0  # ELIMINADO
    db.commit()
    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="ELIMINAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_anterior={"titulo": db_evento.titulo},
        valor_nuevo={"id_estado": 0},
        ip_direccion=ip_address
    )
    return True

def get_inscritos_confirmados(db: Session, id_evento: int, staff_user: models.Usuario):
    if not has_permission(staff_user.rol, PERMISSION_ATTENDANCE_SCAN):
        raise PermisoDenegadoError("No tienes permisos para descargar los inscritos de este evento")
        
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise ValidacionNegocioError("Evento no encontrado")
        
    inscripciones = db.query(models.InscripcionEvento).join(
        models.Usuario, models.InscripcionEvento.id_usuario == models.Usuario.id_usuario
    ).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion == "CONFIRMADA"
    ).all()
    
    resultado = []
    for ins in inscripciones:
        resultado.append({
            "id_inscripcion": ins.id_inscripcion,
            "id_usuario": ins.id_usuario,
            "codigo_qr": ins.codigo_qr or "",
            "asistio": ins.asistio,
            "nombre_completo": f"{ins.usuario.nombres} {ins.usuario.apellidos}"
        })
    return resultado

import os

UPLOAD_QR_DIR = "static/qrs"
if not os.path.exists(UPLOAD_QR_DIR):
    os.makedirs(UPLOAD_QR_DIR, exist_ok=True)

def get_pagos_qr_by_event(db: Session, id_evento: int) -> List[models.EventoPagoQR]:
    """Obtiene todos los paquetes y QRs asociados a un evento."""
    return db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == id_evento,
        models.EventoPagoQR.id_estado == 2
    ).all()

def create_pago_qr(
    db: Session,
    admin_user: models.Usuario,
    id_evento: int,
    nombre_paquete: str,
    monto: float,
    file_content: bytes,
    file_extension: str,
    ip_address: Optional[str] = None
) -> models.EventoPagoQR:
    """Crea un paquete de pago y QR asociado a un evento (ADMIN, ORGANIZADOR, MODERADOR)."""
    if admin_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise PermisoDenegadoError("No tienes permisos para gestionar QRs de pago de eventos")

    # Asegurar existencia física del directorio
    os.makedirs(UPLOAD_QR_DIR, exist_ok=True)

    # Nombre de archivo único
    import uuid
    file_name = f"qr_{id_evento}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(UPLOAD_QR_DIR, file_name)

    with open(file_path, "wb") as output_file:
        output_file.write(file_content)

    nuevo_qr = models.EventoPagoQR(
        id_evento=id_evento,
        nombre_paquete=nombre_paquete,
        monto=monto,
        url_qr=file_path.replace("\\", "/"),
        id_estado=2
    )
    db.add(nuevo_qr)
    db.commit()
    db.refresh(nuevo_qr)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="CREAR_PAQUETE_PAGO_QR",
        tabla_afectada="eventos_pagos_qr",
        id_registro_afectado=nuevo_qr.id_qr,
        valor_nuevo={"id_evento": id_evento, "nombre_paquete": nombre_paquete, "monto": str(monto)},
        ip_direccion=ip_address
    )
    return nuevo_qr

def delete_pago_qr(
    db: Session,
    admin_user: models.Usuario,
    id_qr: int,
    ip_address: Optional[str] = None
) -> bool:
    """Elimina (borrado lógico) un paquete de pago y QR (ADMIN, ORGANIZADOR, MODERADOR)."""
    if admin_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise PermisoDenegadoError("No tienes permisos para gestionar QRs de pago de eventos")

    db_qr = db.query(models.EventoPagoQR).filter(models.EventoPagoQR.id_qr == id_qr).first()
    if not db_qr:
        raise ValidacionNegocioError("Paquete de pago QR no encontrado")

    # Borrado lógico
    db_qr.id_estado = 0
    db.commit()

    # Intentar borrar el archivo físico
    try:
        if os.path.exists(db_qr.url_qr):
            os.remove(db_qr.url_qr)
    except:
        pass

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="ELIMINAR_PAQUETE_PAGO_QR",
        tabla_afectada="eventos_pagos_qr",
        id_registro_afectado=id_qr,
        valor_anterior={"nombre_paquete": db_qr.nombre_paquete},
        valor_nuevo={"id_estado": 0},
        ip_direccion=ip_address
    )
    return True


