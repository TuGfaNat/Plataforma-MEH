from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from ..models import models
from ..core.permissions import PERMISSION_ATTENDANCE_SCAN, ensure_permission

def get_actividades_activas(db: Session):
    # Obtener eventos programados o en curso
    eventos = db.query(models.Evento).filter(
        models.Evento.estado.in_(["PROGRAMADO", "EN_CURSO"])
    ).all()
    
    # Obtener cursos activos
    cursos = db.query(models.Curso).filter(
        models.Curso.estado == "ACTIVO"
    ).all()
    
    return {
        "eventos": eventos,
        "cursos": cursos
    }

def registrar_asistencia_universal(
    db: Session, 
    current_user: models.Usuario,
    tipo: str, # 'EVENTO' o 'CURSO'
    id_actividad: int,
    id_usuario: int
):
    ensure_permission(current_user.rol, PERMISSION_ATTENDANCE_SCAN, "No tienes permiso para registrar asistencia")

    if tipo == 'EVENTO':
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_evento == id_actividad,
            models.InscripcionEvento.id_usuario == id_usuario
        ).first()
        if not inscripcion:
            raise HTTPException(status_code=404, detail="El miembro no está inscrito a este evento")
        
        inscripcion.asistio = True
        inscripcion.fecha_validacion = datetime.utcnow()
        
    elif tipo == 'CURSO':
        inscripcion = db.query(models.InscripcionCurso).filter(
            models.InscripcionCurso.id_curso == id_actividad,
            models.InscripcionCurso.id_usuario == id_usuario
        ).first()
        if not inscripcion:
            raise HTTPException(status_code=404, detail="El miembro no está inscrito a este curso")
        
        # Para cursos, marcamos progreso al 100% como asistencia
        inscripcion.progreso = 100.00
        inscripcion.fecha_completado = datetime.utcnow()
        inscripcion.completado = True

    db.commit()
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    return {
        "status": "success",
        "mensaje": f"Asistencia confirmada para {usuario.nombres} {usuario.apellidos}",
        "usuario": f"{usuario.nombres} {usuario.apellidos}"
    }
