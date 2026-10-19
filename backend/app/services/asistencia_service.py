from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from ..models import models
from ..core.permissions import PERMISSION_ATTENDANCE_SCAN, ensure_permission
from ..core.exceptions import ValidacionNegocioError

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
    """Registra asistencia universal para un EVENTO o CURSO.

    - Para EVENTO: Actualiza 'asistio = True' y 'fecha_validacion = datetime.utcnow()'.
    - Para CURSO: Actualiza 'progreso = 100' y 'finalizado = True'.
      Decisión de diseño: Se preserva el esquema relacional de InscripcionCurso sin
      agregar columnas redundantes de fecha (ej. fecha_completado), manteniendo el
      flujo estándar de auditoría mediante AuditMixin / fecha_modificacion.
    """
    ensure_permission(current_user.rol, PERMISSION_ATTENDANCE_SCAN, "No tienes permiso para registrar asistencia")

    if id_usuario == current_user.id_usuario:
        raise ValidacionNegocioError("No está permitido auto-escanear o registrar tu propia asistencia")

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
        
        # Para cursos, marcamos progreso al 100% y finalizado como asistencia
        # Nota arquitectónica: no se almacena fecha de completado al no existir dicha columna en el modelo InscripcionCurso
        inscripcion.progreso = 100
        inscripcion.finalizado = True

    db.commit()
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    return {
        "status": "success",
        "mensaje": f"Asistencia confirmada para {usuario.nombres} {usuario.apellidos}",
        "usuario": f"{usuario.nombres} {usuario.apellidos}"
    }
