from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import curso as curso_schema
from ..schemas import certificado as certificado_schema
from ..services import cursos_service
from .auth import get_current_user

router = APIRouter(
    prefix="/cursos",
    tags=["cursos"]
)

@router.get("/", response_model=List[curso_schema.CursoResponse])
def get_cursos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return cursos_service.list_cursos(db, skip, limit)

@router.get("/mis-certificados", response_model=List[certificado_schema.CertificadoResponse])
def get_mis_certificados(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return cursos_service.list_user_certificados(db, current_user)

@router.get("/verificar/{uuid_cert}", response_model=certificado_schema.CertificadoPublicResponse)
def verificar_certificado(uuid_cert: str, db: Session = Depends(get_db)):
    return cursos_service.verify_certificado(db, uuid_cert)

@router.post("/", response_model=curso_schema.CursoResponse)
def create_curso(
    request: Request,
    curso: curso_schema.CursoCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return cursos_service.create_curso(db, current_user, curso, ip_address)

@router.get("/{id_curso}", response_model=curso_schema.CursoResponse)
def get_curso(id_curso: int, db: Session = Depends(get_db)):
    return cursos_service.get_curso(db, id_curso)

# RUTAS PARA INSTRUCTORES (MODERADORES+)
@router.get("/instructor/mis-cursos", response_model=List[curso_schema.CursoResponse])
def get_instructor_cursos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return cursos_service.list_cursos_by_instructor(db, current_user.id_usuario)

@router.get("/instructor/curso/{id_curso}/alumnos")
def get_curso_alumnos(
    id_curso: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return cursos_service.list_alumnos_by_curso(db, id_curso, current_user.id_usuario)

@router.put("/instructor/nota/{id_inscripcion}")
def update_nota_alumno(
    id_inscripcion: int,
    nota: float,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return cursos_service.update_nota(db, id_inscripcion, nota, current_user.id_usuario)
