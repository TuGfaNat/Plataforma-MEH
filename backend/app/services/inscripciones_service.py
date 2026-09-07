import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models import models
from ..core.logging import registrar_log
from ..core.exceptions import (
    EventoNoEncontradoError,
    CupoExcedidoError,
    ValidacionNegocioError,
    RecursoNoEncontradoError
)

def inscribir_evento(
    db: Session,
    user_id: int,
    id_evento: int,
    ip_address: Optional[str] = None
) -> models.InscripcionEvento:
    """Inscribe a un usuario en un evento con gestión de cupos, lista de espera y token QR único."""
    evento = db.query(models.Evento).filter(
        models.Evento.id_evento == id_evento,
        models.Evento.id_estado != 0
    ).first()
    if not evento:
        raise EventoNoEncontradoError()

    # Verificar si ya existe una inscripción activa
    inscripcion_existente = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == user_id,
        models.InscripcionEvento.id_evento == id_evento
    ).first()
    
    if inscripcion_existente:
        if inscripcion_existente.id_estado != 0 and inscripcion_existente.estado_inscripcion != "CANCELADA":
            raise ValidacionNegocioError("Ya estás inscrito en este evento")

    # Contar cupos ocupados (CONFIRMADA y PENDIENTE ocupan cupo)
    conteo_ocupados = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion.in_(["CONFIRMADA", "PENDIENTE"]),
        models.InscripcionEvento.id_estado != 0
    ).count()

    # Verificar si el evento tiene paquetes de pago (si no tiene, es gratuito)
    tiene_pagos = db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == id_evento,
        models.EventoPagoQR.id_estado == 2
    ).first() is not None

    if conteo_ocupados >= (evento.capacidad_max or 0):
        # Cupo lleno -> PENDIENTE_APROBACION (Lista de espera, sin QR)
        estado_final = "PENDIENTE_APROBACION"
        token_qr = None
    else:
        # Hay cupo disponible
        if tiene_pagos:
            # Evento de pago -> PENDIENTE (sin QR hasta que apruebe el pago)
            estado_final = "PENDIENTE"
            token_qr = None
        else:
            # Evento gratuito -> CONFIRMADA inmediata con QR único
            estado_final = "CONFIRMADA"
            token_qr = str(uuid.uuid4())

    if inscripcion_existente:
        # Reactivar registro previamente cancelado
        inscripcion_existente.id_estado = 2
        inscripcion_existente.fecha_inscripcion = datetime.utcnow()
        inscripcion_existente.estado_inscripcion = estado_final
        inscripcion_existente.codigo_qr = token_qr
        inscripcion_existente.asistio = False
        inscripcion_existente.fecha_validacion = datetime.utcnow() if estado_final == "CONFIRMADA" else None
        db_inscripcion = inscripcion_existente
    else:
        db_inscripcion = models.InscripcionEvento(
            id_usuario=user_id,
            id_evento=id_evento,
            fecha_inscripcion=datetime.utcnow(),
            estado_inscripcion=estado_final,
            codigo_qr=token_qr,
            asistio=False,
            fecha_validacion=datetime.utcnow() if estado_final == "CONFIRMADA" else None,
            id_estado=2
        )
        db.add(db_inscripcion)

    db.commit()
    db.refresh(db_inscripcion)

    registrar_log(
        db=db,
        id_admin=user_id,
        accion="INSCRIBIR_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=db_inscripcion.id_inscripcion,
        valor_nuevo={"id_evento": id_evento, "estado": estado_final},
        ip_direccion=ip_address
    )

    # Enviar correo de ticket con QR SOLO cuando la inscripción esté CONFIRMADA
    if estado_final == "CONFIRMADA" and token_qr:
        try:
            from . import email_service
            from .eventos_service import parse_incluidos_list
            import os
            usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == user_id).first()
            if usuario:
                items_incluidos = parse_incluidos_list(evento.incluidos)
                email_service.notify_ticket_qr(
                    email=usuario.correo,
                    nombre=usuario.nombres,
                    titulo_evento=evento.titulo,
                    fecha=str(evento.fecha_inicio.date()) if evento.fecha_inicio else "",
                    codigo_qr=token_qr,
                    frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/"),
                    incluidos=items_incluidos
                )
        except Exception as e:
            print("Error enviando email con QR de ticket:", e)

    return db_inscripcion

def list_mis_inscripciones_eventos(db: Session, user_id: int) -> List[models.InscripcionEvento]:
    """Obtiene el historial de inscripciones a eventos de un usuario."""
    return db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == user_id,
        models.InscripcionEvento.id_estado != 0
    ).all()

def cancelar_inscripcion_evento(
    db: Session,
    user_id: int,
    id_inscripcion: int,
    ip_address: Optional[str] = None
) -> None:
    """Cancela una inscripción no confirmada de un usuario, liberando cupo."""
    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_inscripcion == id_inscripcion,
        models.InscripcionEvento.id_usuario == user_id,
        models.InscripcionEvento.id_estado != 0
    ).first()
    
    if not inscripcion:
        raise RecursoNoEncontradoError("Inscripción no encontrada")

    if inscripcion.estado_inscripcion == "CONFIRMADA":
        raise ValidacionNegocioError("No puedes cancelar una inscripción ya confirmada/pagada. Contacta a soporte.")

    inscripcion.estado_inscripcion = "CANCELADA"
    inscripcion.id_estado = 0
    db.commit()

    registrar_log(
        db=db,
        id_admin=user_id,
        accion="CANCELAR_INSCRIPCION_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=id_inscripcion,
        valor_nuevo={"estado": "CANCELADA", "id_estado": 0},
        ip_direccion=ip_address
    )

def aprobar_inscripcion_espera(
    db: Session,
    admin_user: models.Usuario,
    id_inscripcion: int,
    ip_address: Optional[str] = None
) -> models.InscripcionEvento:
    """Aprueba manualmente una inscripción en lista de espera (PENDIENTE_APROBACION) tras ampliar cupos."""
    from ..core.permissions import PERMISSION_EVENTS_MANAGE, has_permission
    from ..core.exceptions import PermisoDenegadoError

    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para gestionar inscripciones")

    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_inscripcion == id_inscripcion,
        models.InscripcionEvento.id_estado != 0
    ).first()
    if not inscripcion:
        raise RecursoNoEncontradoError("Inscripción no encontrada")

    if inscripcion.estado_inscripcion != "PENDIENTE_APROBACION":
        raise ValidacionNegocioError(
            f"Solo se pueden aprobar inscripciones en lista de espera. Estado actual: {inscripcion.estado_inscripcion}"
        )

    evento = inscripcion.evento
    if not evento:
        raise EventoNoEncontradoError()

    # Validar cupos disponibles antes de aprobar
    conteo_ocupados = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == evento.id_evento,
        models.InscripcionEvento.estado_inscripcion.in_(["CONFIRMADA", "PENDIENTE"]),
        models.InscripcionEvento.id_estado != 0
    ).count()

    if conteo_ocupados >= (evento.capacidad_max or 0):
        raise ValidacionNegocioError(
            f"Capacidad máxima ({evento.capacidad_max}) alcanzada. Amplíe la capacidad del evento antes de aprobar participantes de la lista de espera."
        )

    tiene_pagos = db.query(models.EventoPagoQR).filter(
        models.EventoPagoQR.id_evento == evento.id_evento,
        models.EventoPagoQR.id_estado == 2
    ).first() is not None

    if tiene_pagos:
        # Pasa a PENDIENTE para que suba su comprobante
        inscripcion.estado_inscripcion = "PENDIENTE"
        inscripcion.codigo_qr = None
    else:
        # Pasa a CONFIRMADA directamente y genera el QR
        inscripcion.estado_inscripcion = "CONFIRMADA"
        inscripcion.codigo_qr = str(uuid.uuid4())
        inscripcion.fecha_validacion = datetime.utcnow()

        # Enviar email con el QR
        try:
            from . import email_service
            from .eventos_service import parse_incluidos_list
            import os
            usuario = inscripcion.usuario
            if usuario:
                items_incluidos = parse_incluidos_list(evento.incluidos)
                email_service.notify_ticket_qr(
                    email=usuario.correo,
                    nombre=usuario.nombres,
                    titulo_evento=evento.titulo,
                    fecha=str(evento.fecha_inicio.date()) if evento.fecha_inicio else "",
                    codigo_qr=inscripcion.codigo_qr,
                    frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/"),
                    incluidos=items_incluidos
                )
        except Exception as e:
            print("Error enviando email tras aprobación de lista de espera:", e)

    db.commit()
    db.refresh(inscripcion)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="APROBAR_INSCRIPCION_ESPERA",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=id_inscripcion,
        valor_nuevo={"estado": inscripcion.estado_inscripcion},
        ip_direccion=ip_address
    )
    return inscripcion

def list_lista_espera(db: Session, id_evento: int, staff_user: models.Usuario) -> List[models.InscripcionEvento]:
    """Lista los participantes en espera de un evento."""
    from ..core.permissions import PERMISSION_EVENTS_MANAGE, has_permission
    from ..core.exceptions import PermisoDenegadoError

    if not has_permission(staff_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para ver la lista de espera")

    return db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento,
        models.InscripcionEvento.estado_inscripcion == "PENDIENTE_APROBACION",
        models.InscripcionEvento.id_estado != 0
    ).order_by(models.InscripcionEvento.fecha_inscripcion.asc()).all()

def inscribir_curso(
    db: Session,
    user_id: int,
    id_curso: int,
    ip_address: Optional[str] = None
) -> models.InscripcionCurso:
    """Inscribe a un usuario en un curso académico."""
    curso = db.query(models.Curso).filter(models.Curso.id_curso == id_curso).first()
    if not curso:
        raise RecursoNoEncontradoError("Curso no encontrado")

    inscripcion_existente = db.query(models.InscripcionCurso).filter(
        models.InscripcionCurso.id_usuario == user_id,
        models.InscripcionCurso.id_curso == id_curso
    ).first()
    
    if inscripcion_existente:
        raise ValidacionNegocioError("Ya estás inscrito en este curso")

    nueva_inscripcion = models.InscripcionCurso(
        id_usuario=user_id,
        id_curso=id_curso,
        fecha_inscripcion=datetime.utcnow(),
        progreso=0,
        finalizado=False,
        estado_inscripcion="PENDIENTE" # Los cursos pueden requerir pago
    )
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)

    registrar_log(
        db=db,
        id_admin=user_id,
        accion="INSCRIBIR_CURSO",
        tabla_afectada="inscripciones_cursos",
        id_registro_afectado=nueva_inscripcion.id_inscripcion_curso,
        valor_nuevo={"id_curso": id_curso},
        ip_direccion=ip_address
    )
    return nueva_inscripcion
