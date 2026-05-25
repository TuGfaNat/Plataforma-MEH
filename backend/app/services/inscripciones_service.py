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
    """Inscribe a un usuario en un evento generando un QR único."""
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise EventoNoEncontradoError()

    # Verificar si ya existe una inscripción
    inscripcion_existente = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == user_id,
        models.InscripcionEvento.id_evento == id_evento
    ).first()
    if inscripcion_existente:
        raise ValidacionNegocioError("Ya estás inscrito en este evento")

    # Verificar capacidad
    conteo_inscritos = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento
    ).count()
    if conteo_inscritos >= evento.capacidad_max:
        raise CupoExcedidoError()

    # Generar QR único (Token de entrada)
    token_qr = str(uuid.uuid4())

    nueva_inscripcion = models.InscripcionEvento(
        id_usuario=user_id,
        id_evento=id_evento,
        fecha_inscripcion=datetime.utcnow(),
        estado_inscripcion="PENDIENTE",
        codigo_qr=token_qr
    )
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)

    registrar_log(
        db=db,
        id_admin=user_id,
        accion="INSCRIBIR_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=nueva_inscripcion.id_inscripcion,
        valor_nuevo={"id_evento": id_evento, "estado": "PENDIENTE"},
        ip_direccion=ip_address
    )

    # Enviar correo con el QR recien generado
    try:
        from . import email_service
        import os
        usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == user_id).first()
        if usuario:
            email_service.notify_ticket_qr(
                email=usuario.correo,
                nombre=usuario.nombres,
                titulo_evento=evento.titulo,
                fecha=str(evento.fecha_inicio.date()) if evento.fecha_inicio else "",
                codigo_qr=token_qr,
                frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
            )
    except Exception as e:
        print("Error enviando QR", e)
        pass

    return nueva_inscripcion

def list_mis_inscripciones_eventos(db: Session, user_id: int) -> List[models.InscripcionEvento]:
    """Obtiene el historial de inscripciones a eventos de un usuario."""
    return db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == user_id
    ).all()

def cancelar_inscripcion_evento(
    db: Session,
    user_id: int,
    id_inscripcion: int,
    ip_address: Optional[str] = None
) -> None:
    """Cancela una inscripción pendiente de un usuario."""
    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_inscripcion == id_inscripcion,
        models.InscripcionEvento.id_usuario == user_id
    ).first()
    
    if not inscripcion:
        raise RecursoNoEncontradoError("Inscripción no encontrada")

    if inscripcion.estado_inscripcion == "CONFIRMADA":
        raise ValidacionNegocioError("No puedes cancelar una inscripción ya confirmada/pagada. Contacta a soporte.")

    inscripcion.id_estado = 0
    db.commit()

    registrar_log(
        db=db,
        id_admin=user_id,
        accion="CANCELAR_INSCRIPCION_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=id_inscripcion,
        ip_direccion=ip_address
    )

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
