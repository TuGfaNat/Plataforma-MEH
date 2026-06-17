from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import inscripcion as inscripcion_schema
from ..services import inscripciones_service
from .auth import get_current_user

router = APIRouter(
    prefix="/inscripciones",
    tags=["inscripciones"]
)

@router.post("/eventos/{id_evento}", response_model=inscripcion_schema.InscripcionEventoResponse, status_code=status.HTTP_201_CREATED)
def inscribir_evento(
    id_evento: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Inscribe al usuario actual en un evento."""
    ip_address = request.client.host if request.client else None
    return inscripciones_service.inscribir_evento(db, current_user.id_usuario, id_evento, ip_address)

@router.post("/inscribir/{id_evento}", response_model=inscripcion_schema.InscripcionEventoResponse)
def inscribir_evento_legacy(
    id_evento: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Compatibilidad legacy para el flujo de inscripción anterior."""
    ip_address = request.client.host if request.client else None
    return inscripciones_service.inscribir_evento(db, current_user.id_usuario, id_evento, ip_address)

@router.get("/eventos/mis-inscripciones", response_model=List[inscripcion_schema.InscripcionEventoResponse])
def obtener_mis_inscripciones(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene el historial de inscripciones del usuario actual."""
    return inscripciones_service.list_mis_inscripciones_eventos(db, current_user.id_usuario)

@router.delete("/eventos/{id_inscripcion}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_inscripcion(
    id_inscripcion: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Cancela una inscripción pendiente."""
    ip_address = request.client.host if request.client else None
    inscripciones_service.cancelar_inscripcion_evento(db, current_user.id_usuario, id_inscripcion, ip_address)
    return None

@router.post("/cursos/{id_curso}", response_model=inscripcion_schema.InscripcionCursoResponse, status_code=status.HTTP_201_CREATED)
def inscribir_curso(
    id_curso: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Inscribe al usuario actual en un curso."""
    ip_address = request.client.host if request.client else None
    return inscripciones_service.inscribir_curso(db, current_user.id_usuario, id_curso, ip_address)

@router.get("/cursos/mis-inscripciones", response_model=List[inscripcion_schema.InscripcionCursoResponse])
def obtener_mis_inscripciones_cursos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene las inscripciones a cursos del usuario actual."""
    return db.query(models.InscripcionCurso).filter(
        models.InscripcionCurso.id_usuario == current_user.id_usuario
    ).all()

@router.put("/cursos/{id_curso}/progreso", response_model=inscripcion_schema.InscripcionCursoResponse)
def actualizar_progreso_curso(
    id_curso: int,
    progreso: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza el progreso de un usuario en un curso."""
    from fastapi import HTTPException
    inscripcion = db.query(models.InscripcionCurso).filter(
        models.InscripcionCurso.id_usuario == current_user.id_usuario,
        models.InscripcionCurso.id_curso == id_curso
    ).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción al curso no encontrada")
    
    inscripcion.progreso = progreso
    if progreso >= 100:
        inscripcion.finalizado = True
    db.commit()
    db.refresh(inscripcion)
    return inscripcion
