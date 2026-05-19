from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models import models
from ..schemas import curso as schema
from ..core.logging import registrar_log
from ..core.permissions import ensure_permission, PERMISSION_COURSES_MANAGE

# --- LECCIONES ---
def create_leccion(db: Session, data: schema.LeccionCreate, user_id: int):
    obj = models.Leccion(**data.model_dump(), creado_por=user_id, fecha_creacion=datetime.utcnow())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, user_id, "CREAR_LECCION", "lecciones", obj.id_leccion, valor_nuevo=data.model_dump())
    return obj

def list_lecciones(db: Session, id_curso: int):
    return db.query(models.Leccion).filter(models.Leccion.id_curso == id_curso).order_by(models.Leccion.orden).all()

# --- TAREAS ---
def create_tarea(db: Session, data: schema.TareaCreate, user_id: int):
    obj = models.Tarea(**data.model_dump(), creado_por=user_id, fecha_creacion=datetime.utcnow())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, user_id, "CREAR_TAREA", "tareas", obj.id_tarea, valor_nuevo=data.model_dump())
    return obj

# --- ENTREGAS ---
def submit_tarea(db: Session, data: schema.EntregaTareaCreate, user_id: int):
    # Validar si ya entregó
    existente = db.query(models.EntregaTarea).filter(
        models.EntregaTarea.id_tarea == data.id_tarea,
        models.EntregaTarea.id_usuario == user_id
    ).first()
    
    if existente:
        # Actualizar entrega
        existente.archivo_url = data.archivo_url
        existente.comentario_alumno = data.comentario_alumno
        existente.fecha_envio = datetime.utcnow()
        db.commit()
        db.refresh(existente)
        return existente

    obj = models.EntregaTarea(**data.model_dump(), id_usuario=user_id, fecha_envio=datetime.utcnow())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def calificar_entrega(db: Session, id_entrega: int, data: schema.EntregaTareaCalificar, admin_id: int):
    obj = db.query(models.EntregaTarea).filter(models.EntregaTarea.id_entrega == id_entrega).first()
    if not obj: return None
    
    old_nota = obj.nota
    obj.nota = data.nota
    obj.comentario_docente = data.comentario_docente
    obj.modificado_por = admin_id
    obj.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    db.refresh(obj)
    registrar_log(db, admin_id, "CALIFICAR_TAREA", "entregas_tareas", id_entrega, valor_anterior={"nota": old_nota}, valor_nuevo={"nota": data.nota})
    return obj

# --- FOROS ---
def create_post_foro(db: Session, data: schema.PostForoCreate, user_id: int):
    obj = models.PostForo(**data.model_dump(), id_usuario=user_id, creado_por=user_id, fecha_creacion=datetime.utcnow())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def list_posts_foro(db: Session, id_curso: int):
    return db.query(models.PostForo).filter(models.PostForo.id_curso == id_curso).order_by(models.PostForo.fecha_creacion.desc()).all()
