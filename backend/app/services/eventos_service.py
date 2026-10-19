import os
import uuid
import json
import csv
import io
import codecs
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from ..models import models
from ..schemas import evento as evento_schema
from ..core.logging import registrar_log
from ..core.exceptions import (
    EventoNoEncontradoError,
    PermisoDenegadoError,
    CupoExcedidoError,
    ValidacionNegocioError,
    RegistroDuplicadoError
)
from ..core.permissions import (
    PERMISSION_ATTENDANCE_SCAN,
    PERMISSION_EVENTS_MANAGE,
    ADMIN_OR_ORGANIZER_ROLES,
    ROLE_ADMIN,
    ROLE_ORGANIZADOR,
    has_permission,
    ensure_permission
)

def parse_incluidos_list(incluidos_raw) -> List[str]:
    """Parsea el campo incluidos a una lista de strings."""
    if not incluidos_raw:
        return []
    if isinstance(incluidos_raw, list):
        return [str(i).strip() for i in incluidos_raw if str(i).strip()]
    if isinstance(incluidos_raw, str):
        try:
            parsed = json.loads(incluidos_raw)
            if isinstance(parsed, list):
                return [str(i).strip() for i in parsed if str(i).strip()]
        except Exception:
            pass
        return [item.strip() for item in incluidos_raw.split(",") if item.strip()]
    return []

def sync_evento_checkpoints(db: Session, evento: models.Evento):
    """Genera automáticamente los checkpoints de entrega logística y acreditación según los incluidos del evento."""
    checkpoints_existentes = db.query(models.Checkpoint).filter(
        models.Checkpoint.id_evento == evento.id_evento,
        models.Checkpoint.activo == True
    ).all()
    nombres_existentes = {cp.nombre_checkpoint.strip().lower() for cp in checkpoints_existentes}

    orden = len(checkpoints_existentes) + 1

    # 1. Asegurar checkpoint base de Acreditación
    has_acreditacion = any(
        "acreditaci" in name or "entrada" in name or "acceso" in name
        for name in nombres_existentes
    )
    if not has_acreditacion:
        cp_acreditacion = models.Checkpoint(
            id_evento=evento.id_evento,
            nombre_checkpoint="Acreditación y Entrada",
            tipo_checkpoint="ACREDITACION",
            orden=1,
            activo=True
        )
        db.add(cp_acreditacion)
        nombres_existentes.add("acreditación y entrada")
        orden += 1

    # 2. Checkpoints por entregables incluidos dinámicos
    items_incluidos = parse_incluidos_list(evento.incluidos)
    for item in items_incluidos:
        nombre_cp = f"Entrega: {item}" if not item.lower().startswith("entrega") else item
        if nombre_cp.lower() not in nombres_existentes:
            tipo_cp = "REFRIGERIO" if any(k in item.lower() for k in ["refrigerio", "almuerzo", "comida", "snack"]) else "ENTREGABLE"
            cp_item = models.Checkpoint(
                id_evento=evento.id_evento,
                nombre_checkpoint=nombre_cp,
                tipo_checkpoint=tipo_cp,
                orden=orden,
                activo=True
            )
            db.add(cp_item)
            nombres_existentes.add(nombre_cp.lower())
            orden += 1

    # 3. Si refrigerio_incluido es True y no hay checkpoint de refrigerio
    if evento.refrigerio_incluido:
        has_refrigerio = any("refrigerio" in name or "almuerzo" in name for name in nombres_existentes)
        if not has_refrigerio:
            cp_refrig = models.Checkpoint(
                id_evento=evento.id_evento,
                nombre_checkpoint="Entrega: Refrigerio",
                tipo_checkpoint="REFRIGERIO",
                orden=orden,
                activo=True
            )
            db.add(cp_refrig)
            nombres_existentes.add("entrega: refrigerio")
            orden += 1

    db.commit()

def populate_evento_cupos(db: Session, evento: models.Evento):
    """Calcula y rellena los cupos ocupados, disponibles y lista de espera para un evento."""
    if not evento.token_qr:
        evento.token_qr = f"EVENTO_{uuid.uuid4().hex[:12].upper()}"
        db.commit()

    inscripciones = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == evento.id_evento,
        models.InscripcionEvento.id_estado != 0
    ).all()
    
    ocupados = sum(1 for i in inscripciones if i.estado_inscripcion in ("CONFIRMADA", "PENDIENTE"))
    espera = sum(1 for i in inscripciones if i.estado_inscripcion == "PENDIENTE_APROBACION")
    
    evento.cupos_ocupados = ocupados
    evento.cupos_disponibles = max(0, (evento.capacidad_max or 0) - ocupados)
    evento.total_en_espera = espera
    evento.capacidad_maxima = evento.capacidad_max

def create_evento(
    db: Session,
    admin_user: models.Usuario,
    evento_data: evento_schema.EventoCreate,
    ip_address: Optional[str] = None
) -> models.Evento:
    """Crea un nuevo evento en el sistema (Solo Staff autorizado), generando token_qr y auto-checkpoints."""
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para crear eventos")

    data = evento_data.model_dump()
    id_speakers = data.pop("id_speakers", [])
    id_auspiciadores = data.pop("id_auspiciadores", [])
    id_comunidades = data.pop("id_comunidades", [])
    cap_maxima = data.pop("capacidad_maxima", None)
    if cap_maxima is not None:
        data["capacidad_max"] = cap_maxima

    # Generar token_qr del evento al crearlo
    token_qr = f"EVENTO_{uuid.uuid4().hex[:12].upper()}"

    db_evento = models.Evento(
        **data,
        token_qr=token_qr,
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

    # Auto-generar checkpoints para logística
    sync_evento_checkpoints(db, db_evento)
    populate_evento_cupos(db, db_evento)

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

    eventos = db.query(models.Evento).offset(skip).limit(limit).all()
    for ev in eventos:
        populate_evento_cupos(db, ev)
    return eventos

def get_evento_by_id(db: Session, id_evento: int) -> models.Evento:
    """Obtiene un evento por su ID o lanza error de dominio."""
    db_evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not db_evento:
        raise EventoNoEncontradoError()
    populate_evento_cupos(db, db_evento)
    return db_evento

def update_evento(
    db: Session,
    admin_user: models.Usuario,
    id_evento: int,
    evento_update: evento_schema.EventoUpdate,
    ip_address: Optional[str] = None
) -> models.Evento:
    """Actualiza un evento existente (Solo Staff autorizado) y sincroniza checkpoints."""
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para modificar eventos")
        
    db_evento = get_evento_by_id(db, id_evento)
    valor_anterior = {
        "titulo": db_evento.titulo,
        "estado": db_evento.estado,
        "capacidad_max": db_evento.capacidad_max,
        "fecha_inicio": db_evento.fecha_inicio.isoformat() if db_evento.fecha_inicio else None,
        "hora_inicio": db_evento.hora_inicio
    }

    fecha_inicio_ant = db_evento.fecha_inicio
    hora_inicio_ant = db_evento.hora_inicio

    update_data = evento_update.model_dump(exclude_unset=True)
    
    # Manejar relaciones Many-to-Many de forma aislada
    id_speakers = update_data.pop("id_speakers", None)
    id_auspiciadores = update_data.pop("id_auspiciadores", None)
    id_comunidades = update_data.pop("id_comunidades", None)
    cap_maxima = update_data.pop("capacidad_maxima", None)
    auto_aprobar_espera = update_data.pop("auto_aprobar_espera", False)
    if cap_maxima is not None:
        update_data["capacidad_max"] = cap_maxima

    for key, value in update_data.items():
        setattr(db_evento, key, value)

    if id_speakers is not None:
        db_evento.speakers = db.query(models.Speaker).filter(models.Speaker.id_speaker.in_(id_speakers)).all()
    if id_auspiciadores is not None:
        db_evento.auspiciadores = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador.in_(id_auspiciadores)).all()
    if id_comunidades is not None:
        db_evento.comunidades = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad.in_(id_comunidades)).all()

    # Asegurar token_qr
    if not db_evento.token_qr:
        db_evento.token_qr = f"EVENTO_{uuid.uuid4().hex[:12].upper()}"

    db.commit()
    db.refresh(db_evento)

    # Detectar cambio en fecha u horario para aviso automático
    fecha_reprogramada = False
    if "fecha_inicio" in update_data and update_data["fecha_inicio"] is not None:
        if fecha_inicio_ant is None or update_data["fecha_inicio"] != fecha_inicio_ant:
            fecha_reprogramada = True
    elif "hora_inicio" in update_data and update_data["hora_inicio"] is not None:
        if hora_inicio_ant != update_data["hora_inicio"]:
            fecha_reprogramada = True

    if fecha_reprogramada:
        nueva_fecha_str = db_evento.fecha_inicio.strftime("%d/%m/%Y") if db_evento.fecha_inicio else ""
        nuevo_horario = db_evento.hora_inicio or ""

        # In-app anuncio para inscritos
        anuncio_reprog = models.Anuncio(
            titulo=f"Reprogramación de Evento: {db_evento.titulo}",
            contenido=f"El evento '{db_evento.titulo}' ha sido reprogramado. Nueva fecha: {nueva_fecha_str} {nuevo_horario}".strip(),
            tipo="ALERTA",
            categoria="EVENTO",
            id_evento=id_evento,
            solo_inscritos_evento=True,
            id_autor=admin_user.id_usuario,
            activo=True
        )
        db.add(anuncio_reprog)
        db.commit()

        # Notificación por email a inscritos
        try:
            from . import email_service
            inscripciones = db.query(models.InscripcionEvento).filter(
                models.InscripcionEvento.id_evento == id_evento,
                models.InscripcionEvento.id_estado != 0
            ).all()
            for ins in inscripciones:
                if ins.usuario and ins.usuario.correo:
                    try:
                        email_service.notify_evento_reprogramado(
                            email=ins.usuario.correo,
                            nombre=f"{ins.usuario.nombres} {ins.usuario.apellidos}".strip(),
                            titulo_evento=db_evento.titulo,
                            nueva_fecha=nueva_fecha_str,
                            nuevo_horario=nuevo_horario
                        )
                    except Exception:
                        pass
        except Exception:
            pass

    # Sincronizar checkpoints según los incluidos
    sync_evento_checkpoints(db, db_evento)
    populate_evento_cupos(db, db_evento)

    if auto_aprobar_espera:
        try:
            aprobar_lista_espera_lote(db, admin_user, id_evento, cantidad=None, ip_address=ip_address)
            populate_evento_cupos(db, db_evento)
        except Exception as e:
            print("Error en auto_aprobar_espera:", e)

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


def cancelar_evento(
    db: Session,
    admin_user: models.Usuario,
    id_evento: int,
    motivo: str,
    ip_address: Optional[str] = None
) -> models.Evento:
    """Cancela un evento con motivo especificado sin borrar historial y notifica a todos los inscritos."""
    ensure_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para cancelar eventos")

    motivo_limpio = motivo.strip() if motivo else ""
    if not motivo_limpio:
        raise ValidacionNegocioError("Debes especificar un motivo para la cancelación del evento")

    db_evento = get_evento_by_id(db, id_evento)

    valor_anterior = {
        "estado": db_evento.estado,
        "motivo_cancelacion": db_evento.motivo_cancelacion
    }

    db_evento.estado = "CANCELADO"
    db_evento.motivo_cancelacion = motivo_limpio
    db_evento.modificado_por = admin_user.id_usuario
    db_evento.fecha_modificacion = datetime.utcnow()

    db.commit()
    db.refresh(db_evento)
    populate_evento_cupos(db, db_evento)

    # 1. In-app Anuncio urgente segmentado para inscritos
    anuncio_canc = models.Anuncio(
        titulo=f"Evento Cancelado: {db_evento.titulo}",
        contenido=f"El evento '{db_evento.titulo}' ha sido cancelado.\n\nMotivo: {motivo_limpio}",
        tipo="ALERTA",
        categoria="URGENTE",
        id_evento=id_evento,
        solo_inscritos_evento=True,
        id_autor=admin_user.id_usuario,
        activo=True
    )
    db.add(anuncio_canc)
    db.commit()

    # 2. Email a todos los inscritos activos (notifica a todos)
    try:
        from . import email_service
        inscripciones = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_evento == id_evento,
            models.InscripcionEvento.id_estado != 0
        ).all()
        for ins in inscripciones:
            if ins.usuario and ins.usuario.correo:
                try:
                    email_service.notify_evento_cancelado(
                        email=ins.usuario.correo,
                        nombre=f"{ins.usuario.nombres} {ins.usuario.apellidos}".strip(),
                        titulo_evento=db_evento.titulo,
                        motivo=motivo_limpio
                    )
                except Exception:
                    pass
    except Exception:
        pass

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="CANCELAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_anterior=valor_anterior,
        valor_nuevo={"estado": "CANCELADO", "motivo": motivo_limpio},
        ip_direccion=ip_address
    )

    return db_evento


def avisar_inscritos_evento(
    db: Session,
    admin_user: models.Usuario,
    id_evento: int,
    payload: evento_schema.EventoAvisarRequest,
    ip_address: Optional[str] = None
) -> dict:
    """Emite un aviso oficial in-app (y opcionalmente email) exclusivamente a los inscritos con estado CONFIRMADA."""
    ensure_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para emitir avisos a inscritos")

    titulo_limpio = payload.titulo.strip() if payload.titulo else ""
    mensaje_limpio = payload.mensaje.strip() if payload.mensaje else ""

    if not titulo_limpio or not mensaje_limpio:
        raise ValidacionNegocioError("El título y el mensaje del aviso son obligatorios")

    db_evento = get_evento_by_id(db, id_evento)

    # 1. In-app Anuncio segmentado a inscritos del evento
    anuncio = models.Anuncio(
        titulo=f"Aviso - {db_evento.titulo}: {titulo_limpio}",
        contenido=mensaje_limpio,
        tipo="INFO",
        categoria="EVENTO",
        id_evento=id_evento,
        solo_inscritos_evento=True,
        id_autor=admin_user.id_usuario,
        activo=True
    )
    db.add(anuncio)
    db.commit()

    # 2. Filtrar SOLO inscritos en estado CONFIRMADA
    inscripciones_confirmadas = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion == "CONFIRMADA",
        models.InscripcionEvento.id_estado != 0
    ).all()

    emails_enviados = 0
    if payload.enviar_email:
        from . import email_service
        for ins in inscripciones_confirmadas:
            if ins.usuario and ins.usuario.correo:
                try:
                    email_service.notify_aviso_evento(
                        email=ins.usuario.correo,
                        nombre=f"{ins.usuario.nombres} {ins.usuario.apellidos}".strip(),
                        titulo_evento=db_evento.titulo,
                        titulo_aviso=titulo_limpio,
                        mensaje=mensaje_limpio
                    )
                    emails_enviados += 1
                except Exception:
                    pass

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="AVISAR_INSCRITOS_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_nuevo={
            "titulo": titulo_limpio,
            "mensaje": mensaje_limpio,
            "enviar_email": payload.enviar_email,
            "destinatarios_confirmados": len(inscripciones_confirmadas),
            "emails_enviados": emails_enviados
        },
        ip_direccion=ip_address
    )

    return {
        "status": "success",
        "message": f"Aviso emitido exitosamente a {len(inscripciones_confirmadas)} participantes confirmados",
        "destinatarios_notificados": len(inscripciones_confirmadas),
        "emails_enviados": emails_enviados
    }


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
        models.InscripcionEvento.codigo_qr == codigo_qr,
        models.InscripcionEvento.id_estado != 0
    ).first()
    
    if not inscripcion:
        raise ValidacionNegocioError("El código QR no pertenece a ninguna inscripción válida")

    if inscripcion.estado_inscripcion != "CONFIRMADA":
        if inscripcion.estado_inscripcion == "PENDIENTE_APROBACION":
            raise ValidacionNegocioError("La inscripción está en lista de espera (PENDIENTE_APROBACION). Requiere confirmación/ampliación del cupo.")
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

        # Vincular con checkpoint de Acreditación si existe para trazabilidad
        cp_acred = db.query(models.Checkpoint).filter(
            models.Checkpoint.id_evento == inscripcion.id_evento,
            models.Checkpoint.activo == True,
            models.Checkpoint.tipo_checkpoint == "ACREDITACION"
        ).first()
        if cp_acred:
            asistencia_acred = db.query(models.AsistenciaDetalle).filter(
                models.AsistenciaDetalle.id_inscripcion == inscripcion.id_inscripcion,
                models.AsistenciaDetalle.id_checkpoint == cp_acred.id_checkpoint
            ).first()
            if not asistencia_acred:
                nueva_asistencia = models.AsistenciaDetalle(
                    id_inscripcion=inscripcion.id_inscripcion,
                    id_checkpoint=cp_acred.id_checkpoint,
                    fecha_escaneo=datetime.utcnow(),
                    escaneado_por=staff_user.id_usuario,
                    id_estado=2
                )
                db.add(nueva_asistencia)

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
            "nombre_completo": f"{ins.usuario.nombres} {ins.usuario.apellidos}",
            "correo": getattr(ins.usuario, "correo", "") or ""
        })
    return resultado
 
UPLOAD_QR_DIR = "static/qrs"
if not os.path.exists(UPLOAD_QR_DIR):
    os.makedirs(UPLOAD_QR_DIR, exist_ok=True)

def get_pagos_qr_by_event(db: Session, id_evento: int) -> List[models.EventoPagoQR]:
    """Obtiene todos los paquetes y QRs asociados a un evento."""
    return db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == id_evento,
        models.EventoPagoQR.id_estado == 2
    ).all()

def _safe_save_qr_file(id_evento: int, file_content: bytes) -> str:
    """Guarda un archivo de imagen/PDF de QR de forma segura."""
    if file_content.startswith(b"%PDF"):
        safe_ext = ".pdf"
    elif file_content.startswith(b"\xff\xd8\xff"):
        safe_ext = ".jpg"
    elif file_content[:4] == b"RIFF" and file_content[8:12] == b"WEBP":
        safe_ext = ".webp"
    else:
        safe_ext = ".png"

    base_dir = os.path.abspath(UPLOAD_QR_DIR)
    os.makedirs(base_dir, exist_ok=True)
    file_name = f"qr_{int(id_evento)}_{uuid.uuid4().hex}{safe_ext}"
    file_path = os.path.abspath(os.path.join(base_dir, file_name))
    if not file_path.startswith(base_dir):
        raise ValueError("Ruta de archivo no permitida")

    with open(file_path, "wb") as output_file:
        output_file.write(file_content)

    return f"static/qrs/{file_name}"


def create_pago_qr(
    db: Session,
    admin_user: models.Usuario,
    id_evento: int,
    nombre_paquete: str,
    monto: float,
    file_content: bytes,
    ip_address: Optional[str] = None
) -> models.EventoPagoQR:
    """Crea un paquete de pago y QR asociado a un evento con validación y anti-duplicado."""
    if admin_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise PermisoDenegadoError("No tienes permisos para gestionar QRs de pago de eventos")

    nombre_limpio = (nombre_paquete or "").strip()
    if not nombre_limpio:
        raise ValidacionNegocioError("El nombre del paquete no puede estar vacío")
    if monto is None or monto <= 0:
        raise ValidacionNegocioError("El monto del paquete debe ser mayor a 0")

    # Anti-duplicado: verificar si ya existe un paquete con ese nombre en el evento
    duplicado = db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == id_evento,
        models.EventoPagoQR.id_estado != 0,
        func.lower(models.EventoPagoQR.nombre_paquete) == nombre_limpio.lower()
    ).first()
    if duplicado:
        raise ValidacionNegocioError(f"Ya existe un paquete de pago con el nombre '{nombre_limpio}' para este evento")

    rel_url = _safe_save_qr_file(id_evento, file_content)

    nuevo_qr = models.EventoPagoQR(
        id_evento=id_evento,
        nombre_paquete=nombre_limpio,
        monto=monto,
        url_qr=rel_url,
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
        valor_nuevo={"id_evento": id_evento, "nombre_paquete": nombre_limpio, "monto": str(monto)},
        ip_direccion=ip_address
    )
    return nuevo_qr


def update_pago_qr(
    db: Session,
    admin_user: models.Usuario,
    id_qr: int,
    nombre_paquete: Optional[str] = None,
    monto: Optional[float] = None,
    file_content: Optional[bytes] = None,
    ip_address: Optional[str] = None
) -> models.EventoPagoQR:
    """Actualiza datos y/o imagen de un paquete de pago y QR con anti-duplicado (ADMIN, ORGANIZADOR, MODERADOR)."""
    if admin_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise PermisoDenegadoError("No tienes permisos para gestionar QRs de pago de eventos")

    db_qr = db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_qr == id_qr,
        models.EventoPagoQR.id_estado != 0
    ).first()
    if not db_qr:
        raise ValidacionNegocioError("Paquete de pago QR no encontrado")

    if nombre_paquete is not None:
        nombre_limpio = nombre_paquete.strip()
        if not nombre_limpio:
            raise ValidacionNegocioError("El nombre del paquete no puede estar vacío")
        # Anti-duplicado excluyendo el actual
        duplicado = db.query(models.EventoPagoQR).filter(
            models.EventoPagoQR.id_evento == db_qr.id_evento,
            models.EventoPagoQR.id_qr != id_qr,
            models.EventoPagoQR.id_estado != 0,
            func.lower(models.EventoPagoQR.nombre_paquete) == nombre_limpio.lower()
        ).first()
        if duplicado:
            raise ValidacionNegocioError(f"Ya existe otro paquete de pago con el nombre '{nombre_limpio}' para este evento")
        db_qr.nombre_paquete = nombre_limpio

    if monto is not None:
        if monto <= 0:
            raise ValidacionNegocioError("El monto del paquete debe ser mayor a 0")
        db_qr.monto = monto

    if file_content is not None and len(file_content) > 0:
        rel_url = _safe_save_qr_file(db_qr.id_evento, file_content)
        db_qr.url_qr = rel_url

    db.commit()
    db.refresh(db_qr)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="ACTUALIZAR_PAQUETE_PAGO_QR",
        tabla_afectada="eventos_pagos_qr",
        id_registro_afectado=id_qr,
        valor_nuevo={"nombre_paquete": db_qr.nombre_paquete, "monto": str(db_qr.monto)},
        ip_direccion=ip_address
    )
    return db_qr

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

def get_evento_token_qr(db: Session, id_evento: int) -> dict:
    """Obtiene o genera el token_qr único del evento para difusión y acreditación."""
    evento = get_evento_by_id(db, id_evento)
    if not evento.token_qr:
        evento.token_qr = f"EVENTO_{uuid.uuid4().hex[:12].upper()}"
        db.commit()
        db.refresh(evento)
    return {
        "id_evento": evento.id_evento,
        "titulo": evento.titulo,
        "token_qr": evento.token_qr
    }

def get_evento_qr_image(db: Session, id_evento: int) -> Tuple[bytes, str]:
    """Genera y retorna los bytes de la imagen PNG del token_qr del evento para descargar."""
    evento = get_evento_by_id(db, id_evento)
    if not evento.token_qr:
        evento.token_qr = f"EVENTO_{uuid.uuid4().hex[:12].upper()}"
        db.commit()
        db.refresh(evento)

    from .email_service import generate_qr_image_bytes
    qr_bytes = generate_qr_image_bytes(evento.token_qr)
    safe_title = "".join(c for c in evento.titulo if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
    filename = f"QR_EVENTO_{evento.id_evento}_{safe_title}.png"
    return qr_bytes, filename

def _calcular_asistencia_y_fecha(ins: models.InscripcionEvento) -> Tuple[bool, Optional[str]]:
    """Calcula el estado presente y la fecha de acreditación de una inscripción."""
    asistencias = ins.asistencias
    presente = bool(ins.asistio or (asistencias and len(asistencias) > 0))
    fecha_acred = None
    if asistencias:
        fechas = [ad.fecha_escaneo for ad in asistencias if ad.fecha_escaneo]
        if fechas:
            fecha_acred = max(fechas).isoformat()
    if not fecha_acred and ins.fecha_validacion:
        fecha_acred = ins.fecha_validacion.isoformat()
    return presente, fecha_acred


def _obtener_o_crear_checkpoint_acreditacion(db: Session, id_evento: int) -> models.Checkpoint:
    """Busca o crea el checkpoint por defecto para acreditación manual."""
    cp_default = db.query(models.Checkpoint).filter(
        models.Checkpoint.id_evento == id_evento,
        models.Checkpoint.activo.is_(True),
        models.Checkpoint.tipo_checkpoint == "ACREDITACION"
    ).first()

    if not cp_default:
        cp_default = db.query(models.Checkpoint).filter(
            models.Checkpoint.id_evento == id_evento,
            models.Checkpoint.activo.is_(True)
        ).order_by(models.Checkpoint.orden.asc()).first()

    if not cp_default:
        cp_default = models.Checkpoint(
            id_evento=id_evento,
            nombre_checkpoint="Acreditación y Entrada",
            tipo_checkpoint="ACREDITACION",
            orden=1,
            activo=True
        )
        db.add(cp_default)
        db.commit()
        db.refresh(cp_default)

    return cp_default


def get_evento_participantes(db: Session, id_evento: int, staff_user: models.Usuario) -> List[dict]:
    """Obtiene todos los participantes inscritos en el evento con sus respectivos estados de inscripción y asistencia."""
    if not has_permission(staff_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para ver los participantes de este evento")

    get_evento_by_id(db, id_evento)
    inscripciones = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.id_estado != 0
    ).order_by(models.InscripcionEvento.fecha_inscripcion.asc()).all()

    resultado = []
    for ins in inscripciones:
        usuario = ins.usuario
        presente, fecha_acred = _calcular_asistencia_y_fecha(ins)

        resultado.append({
            "id_inscripcion": ins.id_inscripcion,
            "id_usuario": ins.id_usuario,
            "nombre_completo": f"{usuario.nombres} {usuario.apellidos}" if usuario else f"Usuario #{ins.id_usuario}",
            "correo": usuario.correo if usuario else "",
            "estado_inscripcion": ins.estado_inscripcion,
            "codigo_qr": ins.codigo_qr,
            "asistio": ins.asistio,
            "presente": presente,
            "fecha_acreditacion": fecha_acred,
            "fecha_inscripcion": ins.fecha_inscripcion.isoformat() if ins.fecha_inscripcion else None,
            "id_pago": ins.id_pago,
            "usuario": {
                "id_usuario": usuario.id_usuario,
                "nombres": usuario.nombres,
                "apellidos": usuario.apellidos,
                "email": usuario.correo,
                "correo": usuario.correo
            } if usuario else None
        })
    return resultado


def acreditar_participante(
    db: Session,
    staff_user: models.Usuario,
    id_evento: int,
    id_inscripcion: Optional[int] = None,
    codigo_qr: Optional[str] = None,
    ip_address: Optional[str] = None
) -> dict:
    """Acredita manualmente a un participante en el evento (Solo ADMIN y ORGANIZADOR)."""
    if staff_user.rol not in ADMIN_OR_ORGANIZER_ROLES:
        raise PermisoDenegadoError("Solo administradores y organizadores pueden realizar esta acción")

    get_evento_by_id(db, id_evento)

    if not id_inscripcion and not codigo_qr:
        raise ValidacionNegocioError("Debe proporcionar id_inscripcion o codigo_qr para la acreditación")

    query = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.id_estado != 0
    )
    if id_inscripcion:
        inscripcion = query.filter(models.InscripcionEvento.id_inscripcion == id_inscripcion).first()
    else:
        inscripcion = query.filter(models.InscripcionEvento.codigo_qr == codigo_qr).first()

    if not inscripcion:
        raise ValidacionNegocioError("Inscripción no encontrada para este evento")

    if inscripcion.id_estado == 0 or inscripcion.estado_inscripcion == "CANCELADA":
        raise ValidacionNegocioError("No se puede acreditar una inscripción cancelada")

    cp_default = _obtener_o_crear_checkpoint_acreditacion(db, id_evento)

    # Validar anti-duplicado: ya marcado asistio o con detalle en este checkpoint
    asistencia_existente = db.query(models.AsistenciaDetalle).filter(
        models.AsistenciaDetalle.id_inscripcion == inscripcion.id_inscripcion,
        models.AsistenciaDetalle.id_checkpoint == cp_default.id_checkpoint
    ).first()

    if inscripcion.asistio or asistencia_existente:
        raise RegistroDuplicadoError("El participante ya se encuentra acreditado / marcado como presente")

    # Registrar AsistenciaDetalle físico
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    nueva_asistencia = models.AsistenciaDetalle(
        id_inscripcion=inscripcion.id_inscripcion,
        id_checkpoint=cp_default.id_checkpoint,
        fecha_escaneo=now_utc,
        escaneado_por=staff_user.id_usuario,
        id_estado=2
    )
    db.add(nueva_asistencia)
    db.flush()

    inscripcion.asistio = True
    inscripcion.fecha_validacion = now_utc
    if inscripcion.estado_inscripcion != "CONFIRMADA":
        inscripcion.estado_inscripcion = "CONFIRMADA"

    usuario = inscripcion.usuario
    registrar_log(
        db=db,
        id_admin=staff_user.id_usuario,
        accion="ACREDITACION_MANUAL",
        tabla_afectada="asistencia_detalles",
        id_registro_afectado=nueva_asistencia.id_asistencia,
        valor_nuevo={
            "id_inscripcion": inscripcion.id_inscripcion,
            "id_evento": id_evento,
            "nombre_usuario": f"{usuario.nombres} {usuario.apellidos}" if usuario else f"Usuario #{inscripcion.id_usuario}",
            "checkpoint": cp_default.nombre_checkpoint
        },
        ip_direccion=ip_address
    )

    db.commit()
    db.refresh(inscripcion)

    return {
        "status": "success",
        "message": "Participante acreditado exitosamente",
        "id_inscripcion": inscripcion.id_inscripcion,
        "presente": True,
        "asistio": True,
        "fecha_acreditacion": nueva_asistencia.fecha_escaneo.isoformat() if nueva_asistencia.fecha_escaneo else None,
        "checkpoint": cp_default.nombre_checkpoint
    }


def export_inscritos_csv(db: Session, current_user: models.Usuario, id_evento: int) -> Tuple[bytes, str]:
    """Genera y descarga un archivo CSV con la lista de todos los inscritos del evento con UTF-8 BOM (Solo Staff)."""
    if current_user.rol not in ADMIN_OR_ORGANIZER_ROLES and not has_permission(current_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("Solo administradores y organizadores pueden exportar la lista de inscritos")

    get_evento_by_id(db, id_evento)

    inscripciones = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.id_estado != 0
    ).order_by(models.InscripcionEvento.fecha_inscripcion.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "Nombre Completo",
        "Correo",
        "Estado Inscripcion",
        "Fecha Registro",
        "Codigo QR",
        "Estado Asistencia"
    ])

    for insc in inscripciones:
        u = insc.usuario
        nombre = f"{u.nombres} {u.apellidos}".strip() if u else f"Usuario #{insc.id_usuario}"
        correo = u.correo if u else ""
        estado = insc.estado_inscripcion
        fecha_dt = getattr(insc, "fecha_inscripcion", None) or getattr(insc, "fecha_creacion", None)
        fecha_str = fecha_dt.strftime("%Y-%m-%d %H:%M:%S") if fecha_dt else ""
        codigo_qr = insc.codigo_qr or ""
        asistio_flag = bool(insc.asistio or (insc.asistencias and len(insc.asistencias) > 0))
        asistencia_estado = "PRESENTE" if asistio_flag else "AUSENTE"

        writer.writerow([nombre, correo, estado, fecha_str, codigo_qr, asistencia_estado])

    csv_bytes = codecs.BOM_UTF8 + output.getvalue().encode("utf-8")
    filename = f"inscritos_evento_{id_evento}.csv"
    return csv_bytes, filename


def aprobar_lista_espera_lote(
    db: Session,
    current_user: models.Usuario,
    id_evento: int,
    cantidad: Optional[int] = None,
    ip_address: Optional[str] = None
) -> dict:
    """Aprueba en lote a los inscritos en lista de espera (PENDIENTE_APROBACION) respetando cupos (Solo Staff)."""
    if current_user.rol not in ADMIN_OR_ORGANIZER_ROLES and not has_permission(current_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("Solo administradores y organizadores pueden gestionar la lista de espera")

    evento = get_evento_by_id(db, id_evento)

    capacidad = evento.capacidad_max or evento.capacidad_maxima or 0
    ocupados = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion.in_(["CONFIRMADA", "PENDIENTE"]),
        models.InscripcionEvento.id_estado != 0
    ).count()

    cupos_disponibles = max(0, capacidad - ocupados)

    query_espera = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion == "PENDIENTE_APROBACION",
        models.InscripcionEvento.id_estado != 0
    ).order_by(models.InscripcionEvento.fecha_inscripcion.asc())

    total_espera = query_espera.count()

    limite = cupos_disponibles
    if cantidad is not None and cantidad > 0:
        limite = min(limite, cantidad)

    a_aprobar = query_espera.limit(limite).all() if limite > 0 else []

    tiene_pagos = db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == id_evento,
        models.EventoPagoQR.id_estado == 2
    ).first() is not None

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    items_incluidos = parse_incluidos_list(evento.incluidos)

    from . import email_service
    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

    for insc in a_aprobar:
        if tiene_pagos:
            insc.estado_inscripcion = "PENDIENTE"
            insc.codigo_qr = None
        else:
            insc.estado_inscripcion = "CONFIRMADA"
            insc.codigo_qr = str(uuid.uuid4())
            insc.fecha_validacion = now_utc

            if insc.usuario:
                try:
                    email_service.notify_ticket_qr(
                        email=insc.usuario.correo,
                        nombre=insc.usuario.nombres,
                        titulo_evento=evento.titulo,
                        fecha=str(evento.fecha_inicio.date()) if evento.fecha_inicio else "",
                        codigo_qr=insc.codigo_qr,
                        frontend_url=frontend_url,
                        incluidos=items_incluidos
                    )
                except Exception as e:
                    print(f"Error enviando email tras aprobación lote: {e}")

    if a_aprobar:
        registrar_log(
            db=db,
            id_admin=current_user.id_usuario,
            accion="APROBAR_LOTE_LISTA_ESPERA",
            tabla_afectada="inscripciones_eventos",
            id_registro_afectado=id_evento,
            valor_nuevo={
                "id_evento": id_evento,
                "aprobados_count": len(a_aprobar),
                "ids_inscripciones": [ins.id_inscripcion for ins in a_aprobar]
            },
            ip_direccion=ip_address
        )
        db.commit()

    return {
        "status": "success",
        "id_evento": id_evento,
        "aprobados": len(a_aprobar),
        "restantes_en_espera": total_espera - len(a_aprobar),
        "cupos_disponibles": max(0, cupos_disponibles - len(a_aprobar))
    }


def duplicar_evento(
    db: Session,
    current_user: models.Usuario,
    id_evento: int,
    ip_address: Optional[str] = None
) -> models.Evento:
    """Duplica un evento existente con sus campos, agenda, speakers y paquetes, sin inscripciones (Solo Staff)."""
    if current_user.rol not in ADMIN_OR_ORGANIZER_ROLES and not has_permission(current_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("Solo administradores y organizadores pueden duplicar eventos")

    original = get_evento_by_id(db, id_evento)

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    nuevo_evento = models.Evento(
        titulo=f"{original.titulo} (Copia)",
        descripcion=original.descripcion,
        tipo_evento=original.tipo_evento,
        fecha_inicio=original.fecha_inicio,
        fecha_fin=original.fecha_fin,
        hora_inicio=original.hora_inicio,
        hora_fin=original.hora_fin,
        modalidad=original.modalidad,
        ubicacion=original.ubicacion,
        link_mapas=original.link_mapas,
        agenda=original.agenda,
        capacidad_max=original.capacidad_max,
        imagen_url=original.imagen_url,
        refrigerio_incluido=original.refrigerio_incluido,
        incluidos=original.incluidos,
        id_estado=2,
        estado="PROGRAMADO" if original.estado != "BORRADOR" else "BORRADOR",
        motivo_cancelacion=None,
        token_qr=f"EVENTO_{uuid.uuid4().hex[:12].upper()}",
        id_organizador=current_user.id_usuario,
        creado_por=current_user.id_usuario,
        fecha_creacion=now_utc
    )
    db.add(nuevo_evento)
    db.flush()

    # Copiar relaciones Many-to-Many
    if original.speakers:
        for spk in original.speakers:
            nuevo_evento.speakers.append(spk)
    if original.auspiciadores:
        for ausp in original.auspiciadores:
            nuevo_evento.auspiciadores.append(ausp)
    if original.comunidades:
        for com in original.comunidades:
            nuevo_evento.comunidades.append(com)

    # Copiar paquetes de pago QR si existen
    paquetes = db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == original.id_evento,
        models.EventoPagoQR.id_estado == 2
    ).all()
    for pkg in paquetes:
        nuevo_pkg = models.EventoPagoQR(
            id_evento=nuevo_evento.id_evento,
            nombre_paquete=pkg.nombre_paquete,
            monto=pkg.monto,
            url_qr=pkg.url_qr,
            creado_por=current_user.id_usuario,
            fecha_creacion=now_utc,
            id_estado=2
        )
        db.add(nuevo_pkg)

    sync_evento_checkpoints(db, nuevo_evento)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="DUPLICAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=nuevo_evento.id_evento,
        valor_nuevo={
            "id_evento_origen": original.id_evento,
            "titulo": nuevo_evento.titulo,
            "id_evento_nuevo": nuevo_evento.id_evento
        },
        ip_direccion=ip_address
    )

    db.commit()
    db.refresh(nuevo_evento)
    populate_evento_cupos(db, nuevo_evento)
    return nuevo_evento


# ==============================================================================
# MEH-019: LLEGADAS POR HORA, CHECKPOINTS Y BADGE SOCIAL
# ==============================================================================

def _calcular_histograma_llegadas(db: Session, id_evento: int) -> list:
    """Calcula el histograma acumulativo de llegadas agrupado por hora."""
    detalles = db.query(models.AsistenciaDetalle).join(
        models.InscripcionEvento, models.AsistenciaDetalle.id_inscripcion == models.InscripcionEvento.id_inscripcion
    ).filter(
        models.InscripcionEvento.id_evento == id_evento
    ).order_by(models.AsistenciaDetalle.fecha_escaneo.asc()).all()

    horas_dict = {}
    if detalles:
        for det in detalles:
            if det.fecha_escaneo:
                h_str = det.fecha_escaneo.strftime("%H:00")
                horas_dict[h_str] = horas_dict.get(h_str, 0) + 1
    else:
        # Fallback para asistencias marcadas directamente
        inscritos_asistieron = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_evento == id_evento,
            models.InscripcionEvento.asistio == True
        ).all()
        for ins in inscritos_asistieron:
            fec = ins.fecha_validacion or ins.fecha_inscripcion
            if fec:
                h_str = fec.strftime("%H:00")
                horas_dict[h_str] = horas_dict.get(h_str, 0) + 1

    histograma = []
    acumulado = 0
    for h in sorted(horas_dict.keys()):
        cant = horas_dict[h]
        acumulado += cant
        histograma.append({
            "hora": h,
            "cantidad": cant,
            "acumulado": acumulado
        })
    return histograma


def _calcular_checkpoints_llegadas(db: Session, id_evento: int, total_asistieron: int) -> list:
    """Calcula los totales y porcentajes por checkpoint del evento."""
    cps = db.query(models.Checkpoint).filter(
        models.Checkpoint.id_evento == id_evento
    ).order_by(models.Checkpoint.orden.asc()).all()

    checkpoints_resumen = []
    total_en_checkpoints = 0
    for cp in cps:
        cnt = db.query(models.AsistenciaDetalle).filter(
            models.AsistenciaDetalle.id_checkpoint == cp.id_checkpoint
        ).count()
        total_en_checkpoints += cnt
        pct = round((cnt / total_asistieron * 100), 1) if total_asistieron > 0 else 0.0
        checkpoints_resumen.append({
            "id_checkpoint": cp.id_checkpoint,
            "nombre_checkpoint": cp.nombre_checkpoint,
            "total": cnt,
            "porcentaje": pct
        })

    # Si no hay checkpoints o si hay escaneos generales fuera de checkpoints
    if not cps or (total_en_checkpoints == 0 and total_asistieron > 0):
        checkpoints_resumen.insert(0, {
            "id_checkpoint": None,
            "nombre_checkpoint": "Acreditación General",
            "total": total_asistieron,
            "porcentaje": 100.0 if total_asistieron > 0 else 0.0
        })

    return checkpoints_resumen


def get_llegadas_evento(db: Session, id_evento: int, user: models.Usuario) -> dict:
    """Calcula histograma de llegadas por hora y resumen por checkpoints para el evento (Solo Staff o Creador)."""
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise EventoNoEncontradoError()

    es_staff = (
        has_permission(user.rol, PERMISSION_ATTENDANCE_SCAN) or
        has_permission(user.rol, PERMISSION_EVENTS_MANAGE) or
        evento.id_organizador == user.id_usuario
    )
    if not es_staff:
        raise PermisoDenegadoError("No tienes permisos para ver las métricas de llegadas de este evento")

    # Conteos generales
    total_inscritos = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion == "CONFIRMADA"
    ).count()

    total_asistieron = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.asistio == True
    ).count()

    pct_asistencia = round((total_asistieron / total_inscritos * 100), 1) if total_inscritos > 0 else 0.0

    histograma = _calcular_histograma_llegadas(db, id_evento)
    checkpoints_resumen = _calcular_checkpoints_llegadas(db, id_evento, total_asistieron)

    return {
        "id_evento": evento.id_evento,
        "titulo": evento.titulo,
        "total_inscritos": total_inscritos,
        "total_asistieron": total_asistieron,
        "porcentaje_asistencia": pct_asistencia,
        "histograma_horas": histograma,
        "checkpoints": checkpoints_resumen
    }

def get_badge_social_info(db: Session, id_evento: int, user: models.Usuario) -> dict:
    """Genera la información de badge social para un usuario inscrito (o previsualización staff)."""
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise EventoNoEncontradoError()

    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.id_usuario == user.id_usuario
    ).first()

    es_staff = (
        has_permission(user.rol, PERMISSION_EVENTS_MANAGE) or
        evento.id_organizador == user.id_usuario
    )

    if not inscripcion and not es_staff:
        raise PermisoDenegadoError("Solo los participantes inscritos pueden generar su badge social")

    rol_evento = "ASISTENTE"
    if evento.id_organizador == user.id_usuario or user.rol in ["ADMIN", "ORGANIZADOR"]:
        rol_evento = "ORGANIZADOR"
    elif user.rol == "EMBAJADOR":
        rol_evento = "EMBAJADOR"
    elif user.rol == "MODERADOR":
        rol_evento = "MODERADOR"

    redes = {
        "linkedin": getattr(user, "linkedin_url", None),
        "github": getattr(user, "github_url", None),
        "instagram": getattr(user, "instagram_url", None),
        "tiktok": getattr(user, "tiktok_url", None)
    }

    nombre_completo = f"{user.nombres or ''} {user.apellidos or ''}".strip()
    if not nombre_completo:
        nombre_completo = user.alias or user.correo.split("@")[0]

    copy_sugerido = f"¡Ya tengo mi pase para {evento.titulo}! 🎉 Nos vemos en este gran evento de la comunidad MEH. #ComunidadMEH #TechBolivia"

    return {
        "id_evento": evento.id_evento,
        "titulo_evento": evento.titulo,
        "fecha_evento": evento.fecha_inicio.isoformat() if evento.fecha_inicio else None,
        "modalidad": evento.modalidad,
        "ubicacion": evento.ubicacion,
        "plantilla_badge_url": evento.plantilla_badge_url,
        "id_usuario": user.id_usuario,
        "nombre_completo": nombre_completo,
        "foto_perfil_url": user.foto_url,
        "rol_evento": rol_evento,
        "codigo_qr": (inscripcion.codigo_qr if inscripcion else evento.token_qr) or f"MEH-EVT-{evento.id_evento}-{user.id_usuario}",
        "redes_sociales": redes,
        "copy_sugerido": copy_sugerido,
        "esta_inscrito": inscripcion is not None
    }

def upload_plantilla_badge(
    db: Session,
    id_evento: int,
    admin_user: models.Usuario,
    file_content: bytes,
    ip_address: Optional[str] = None
) -> str:
    """Guarda la plantilla de badge de un evento y actualiza la URL en la base de datos (Solo Staff)."""
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise EventoNoEncontradoError()

    es_staff = (
        has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE) or
        evento.id_organizador == admin_user.id_usuario
    )
    if not es_staff:
        raise PermisoDenegadoError("No tienes permisos para configurar la plantilla de badge de este evento")

    if file_content.startswith(b"\xff\xd8\xff"):
        safe_ext = ".jpg"
    elif file_content[:4] == b"RIFF" and file_content[8:12] == b"WEBP":
        safe_ext = ".webp"
    else:
        safe_ext = ".png"

    unique_token = uuid.uuid4().hex
    safe_filename = f"badge_plantilla_evento_{int(id_evento)}_{unique_token}{safe_ext}"

    base_dir = os.path.abspath("static/badges")
    os.makedirs(base_dir, exist_ok=True)

    target_path = os.path.abspath(os.path.join(base_dir, safe_filename))
    if not target_path.startswith(base_dir):
        raise ValueError("Ruta de archivo no permitida")

    with open(target_path, "wb") as f:
        f.write(file_content)

    url_relativa = f"/static/badges/{safe_filename}"
    evento.plantilla_badge_url = url_relativa

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="ACTUALIZAR_PLANTILLA_BADGE",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_nuevo={"plantilla_badge_url": url_relativa},
        ip_direccion=ip_address
    )

    db.commit()
    db.refresh(evento)
    return url_relativa
