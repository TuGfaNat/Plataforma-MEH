from fastapi import HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from ..models import models
from ..schemas import curso as curso_schema
from ..core.logging import registrar_log
from ..core.permissions import PERMISSION_COURSES_MANAGE, ensure_permission


def list_cursos(db: Session, skip: int = 0, limit: int = 100) -> List[models.Curso]:
    return db.query(models.Curso).offset(skip).limit(limit).all()


def list_user_certificados(db: Session, current_user: models.Usuario):
    certs = db.query(models.Certificado).filter(models.Certificado.id_usuario == current_user.id_usuario).all()
    results = []
    for cert in certs:
        nombre_entidad = "Evento/Curso"
        if cert.id_curso:
            curso = db.query(models.Curso).filter(models.Curso.id_curso == cert.id_curso).first()
            if curso: nombre_entidad = curso.nombre_curso
        elif cert.id_evento:
            evento = db.query(models.Evento).filter(models.Evento.id_evento == cert.id_evento).first()
            if evento: nombre_entidad = evento.titulo
        
        results.append({
            "id_certificado": cert.id_certificado,
            "id_usuario": cert.id_usuario,
            "codigo_verificacion": cert.codigo_verificacion,
            "url_pdf": cert.url_pdf,
            "formato": cert.formato,
            "fecha_emision": cert.fecha_emision,
            "uuid_verificacion": cert.uuid_verificacion,
            "nombre_curso_evento": nombre_entidad
        })
    return results


def verify_certificado(db: Session, uuid_cert: str) -> dict:
    # Buscar por UUID o por Código de Verificación legible
    cert = db.query(models.Certificado).filter(
        (models.Certificado.uuid_verificacion == uuid_cert) | 
        (models.Certificado.codigo_verificacion == uuid_cert)
    ).first()
    
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado o inválido")

    nombre_entidad = "Evento/Curso Desconocido"
    if cert.id_curso:
        curso = db.query(models.Curso).filter(models.Curso.id_curso == cert.id_curso).first()
        if curso:
            nombre_entidad = curso.nombre_curso
    elif cert.id_evento:
        evento = db.query(models.Evento).filter(models.Evento.id_evento == cert.id_evento).first()
        if evento:
            nombre_entidad = evento.titulo

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


def create_curso(
    db: Session,
    current_user: models.Usuario,
    curso: curso_schema.CursoCreate,
    ip_address: Optional[str]
) -> models.Curso:
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE, "No tienes permisos para crear cursos")

    db_curso = models.Curso(
        **curso.model_dump(),
        creado_por=current_user.id_usuario # MIXIN
    )
    db.add(db_curso)
    db.commit()
    db.refresh(db_curso)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_CURSO",
        tabla_afectada="cursos",
        id_registro_afectado=db_curso.id_curso,
        valor_nuevo=curso.model_dump(),
        ip_direccion=ip_address
    )
    return db_curso


def get_curso(db: Session, id_curso: int) -> models.Curso:
    db_curso = db.query(models.Curso).filter(models.Curso.id_curso == id_curso).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return db_curso

# LOGICA DE INSTRUCTOR Y ADMIN
def list_cursos_by_instructor(db: Session, id_instructor: int) -> List[models.Curso]:
    return db.query(models.Curso).filter(models.Curso.id_instructor == id_instructor).all()

def list_alumnos_by_curso(db: Session, id_curso: int, current_user_id: int, current_user_role: str):
    curso = db.query(models.Curso).filter(models.Curso.id_curso == id_curso).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    if curso.id_instructor != current_user_id and current_user_role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los alumnos de este curso")
    
    return db.query(models.InscripcionCurso).filter(models.InscripcionCurso.id_curso == id_curso).all()

def update_nota(db: Session, id_inscripcion: int, nota: float, current_user_id: int, current_user_role: str):
    inscripcion = db.query(models.InscripcionCurso).filter(models.InscripcionCurso.id_inscripcion == id_inscripcion).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    curso = db.query(models.Curso).filter(models.Curso.id_curso == inscripcion.id_curso).first()
    if curso.id_instructor != current_user_id and current_user_role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permiso para calificar en este curso")
    
    inscripcion.nota_final = nota
    if nota >= 51:
        inscripcion.finalizado = True
        # EMITIR CERTIFICADO AUTOMÁTICO
        nuevo_cert = models.Certificado(
            id_usuario=inscripcion.id_usuario,
            id_curso=inscripcion.id_curso,
            codigo_verificacion=f"MEH-CUR-{inscripcion.id_inscripcion}-{datetime.utcnow().strftime('%Y%m%d')}",
            url_pdf=curso.plantilla_certificado_url if hasattr(curso, 'plantilla_certificado_url') else "https://ejemplo.com/default-cert.pdf",
            fecha_emision=datetime.utcnow(),
            creado_por=current_user_id
        )
        db.add(nuevo_cert)
        # NOTIFICACION EMAIL
        try:
            from . import email_service
            email_service.notify_nuevo_certificado(inscripcion.usuario.correo, inscripcion.usuario.nombres, curso.nombre_curso)
        except Exception as e:
            print(f"Error al enviar email de certificado: {str(e)}")
    
    # MIXIN AUDITORIA
    inscripcion.modificado_por = current_user_id
    inscripcion.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    return {"message": "Nota actualizada", "id_inscripcion": id_inscripcion, "nota": nota}

def assign_instructor(db: Session, id_curso: int, id_instructor: int):
    curso = db.query(models.Curso).filter(models.Curso.id_curso == id_curso).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    instructor = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_instructor).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor no encontrado")

    curso.id_instructor = id_instructor
    db.commit()
    return {"message": f"Instructor {instructor.nombres} asignado al curso {curso.nombre_curso}"}
