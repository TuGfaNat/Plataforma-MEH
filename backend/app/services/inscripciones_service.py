from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import models
from ..core.logging import registrar_log


def inscribir_evento(
    db: Session,
    current_user: models.Usuario,
    id_evento: int,
    ip_address: Optional[str]
) -> models.InscripcionEvento:
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    inscripcion_existente = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == current_user.id_usuario,
        models.InscripcionEvento.id_evento == id_evento
    ).first()
    if inscripcion_existente:
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este evento")

    conteo_inscritos = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento
    ).count()
    if conteo_inscritos >= evento.capacidad_max:
        raise HTTPException(status_code=400, detail="El evento ha alcanzado su capacidad máxima")

    nueva_inscripcion = models.InscripcionEvento(
        id_usuario=current_user.id_usuario,
        id_evento=id_evento,
        fecha_inscripcion=datetime.utcnow(),
        estado_inscripcion="PENDIENTE"
    )
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="INSCRIBIR_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=nueva_inscripcion.id_inscripcion,
        valor_nuevo={"id_evento": id_evento, "estado": "PENDIENTE"},
        ip_direccion=ip_address
    )
    return nueva_inscripcion


def list_mis_inscripciones_eventos(db: Session, current_user: models.Usuario) -> List[models.InscripcionEvento]:
    return db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == current_user.id_usuario
    ).all()


def cancelar_inscripcion_evento(
    db: Session,
    current_user: models.Usuario,
    id_inscripcion: int,
    ip_address: Optional[str]
) -> None:
    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_inscripcion == id_inscripcion,
        models.InscripcionEvento.id_usuario == current_user.id_usuario
    ).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    db.delete(inscripcion)
    db.commit()

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CANCELAR_INSCRIPCION_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=id_inscripcion,
        ip_direccion=ip_address
    )


def inscribir_curso(
    db: Session,
    current_user: models.Usuario,
    id_curso: int,
    ip_address: Optional[str]
) -> models.InscripcionCurso:
    curso = db.query(models.Curso).filter(models.Curso.id_curso == id_curso).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    inscripcion_existente = db.query(models.InscripcionCurso).filter(
        models.InscripcionCurso.id_usuario == current_user.id_usuario,
        models.InscripcionCurso.id_curso == id_curso
    ).first()
    if inscripcion_existente:
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este curso")

    nueva_inscripcion = models.InscripcionCurso(
        id_usuario=current_user.id_usuario,
        id_curso=id_curso,
        fecha_inscripcion=datetime.utcnow(),
        progreso=0,
        completado=False
    )
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="INSCRIBIR_CURSO",
        tabla_afectada="inscripciones_cursos",
        id_registro_afectado=nueva_inscripcion.id_inscripcion_curso,
        valor_nuevo={"id_curso": id_curso},
        ip_direccion=ip_address
    )
    return nueva_inscripcion
