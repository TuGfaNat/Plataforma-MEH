from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import inscripcion as inscripcion_schema
from ..services import inscripciones_service
from .auth import get_current_user

router = APIRouter(
    prefix="/inscripciones",
    tags=["inscripciones"]
)

@router.post("/eventos/{id_evento}", response_model=inscripcion_schema.InscripcionEventoResponse)
def inscribir_evento(
    id_evento: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return inscripciones_service.inscribir_evento(db, current_user, id_evento, ip_address)

@router.get("/eventos/mis-inscripciones", response_model=List[inscripcion_schema.InscripcionEventoResponse])
def obtener_mis_inscripciones(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return inscripciones_service.list_mis_inscripciones_eventos(db, current_user)

@router.delete("/eventos/{id_inscripcion}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_inscripcion(
    id_inscripcion: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    inscripciones_service.cancelar_inscripcion_evento(db, current_user, id_inscripcion, ip_address)
    return None


@router.post("/cursos/{id_curso}", response_model=inscripcion_schema.InscripcionCursoResponse)
def inscribir_curso(
    id_curso: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return inscripciones_service.inscribir_curso(db, current_user, id_curso, ip_address)
