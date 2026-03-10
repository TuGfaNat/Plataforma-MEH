from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import curso as curso_schema
from ..schemas import certificado as certificado_schema
from ..core.logging import registrar_log
from .auth import get_current_user

router = APIRouter(
    prefix="/cursos",
    tags=["cursos"]
)

@router.get("/", response_model=List[curso_schema.CursoResponse])
def get_cursos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Curso).offset(skip).limit(limit).all()

@router.get("/mis-certificados", response_model=List[certificado_schema.CertificadoResponse])
def get_mis_certificados(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return db.query(models.Certificado).filter(models.Certificado.id_usuario == current_user.id_usuario).all()

@router.get("/verificar/{uuid_cert}", response_model=certificado_schema.CertificadoPublicResponse)
def verificar_certificado(uuid_cert: str, db: Session = Depends(get_db)):
    cert = db.query(models.Certificado).filter(models.Certificado.uuid_verificacion == uuid_cert).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado o inválido")
    
    # Obtener nombre del curso o evento
    nombre_entidad = "Evento/Curso Desconocido"
    if cert.id_curso:
        curso = db.query(models.Curso).filter(models.Curso.id_curso == cert.id_curso).first()
        if curso: nombre_entidad = curso.nombre_curso
    elif cert.id_evento:
        evento = db.query(models.Evento).filter(models.Evento.id_evento == cert.id_evento).first()
        if evento: nombre_entidad = evento.titulo

    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == cert.id_usuario).first()
    nombre_completo = f"{usuario.nombres} {usuario.apellidos}" if usuario else "Usuario Desconocido"

    return {
        "codigo_verificacion": cert.codigo_verificacion,
        "nombre_usuario": nombre_completo,
        "nombre_curso_evento": nombre_entidad,
        "fecha_emision": cert.fecha_emision,
        "formato": cert.formato,
        "es_valido": True
    }

@router.post("/", response_model=curso_schema.CursoResponse)
def create_curso(
    request: Request,
    curso: curso_schema.CursoCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear cursos")

    db_curso = models.Curso(**curso.model_dump())
    db.add(db_curso)
    db.commit()
    db.refresh(db_curso)

    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_CURSO",
        tabla_afectada="cursos",
        id_registro_afectado=db_curso.id_curso,
        valor_nuevo=curso.model_dump(),
        ip_direccion=request.client.host
    )
    
    return db_curso

@router.get("/{id_curso}", response_model=curso_schema.CursoResponse)
def get_curso(id_curso: int, db: Session = Depends(get_db)):
    db_curso = db.query(models.Curso).filter(models.Curso.id_curso == id_curso).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return db_curso
