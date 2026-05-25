from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models import models
from ..schemas import curso as schema
from ..core.logging import registrar_log
from ..core.permissions import ensure_permission, PERMISSION_EVENTS_MANAGE

# --- LECCIONES ---
def create_leccion(db: Session, data: schema.LeccionCreate, user_id: int):
    obj = models.Leccion(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, user_id, "CREAR_LECCION", "lecciones", obj.id_leccion, valor_nuevo=data.model_dump())
    return obj

def update_leccion(db: Session, id_leccion: int, data: dict, user_id: int):
    obj = db.query(models.Leccion).filter(models.Leccion.id_leccion == id_leccion).first()
    if not obj: return None
    
    old_data = {k: getattr(obj, k) for k in data.keys() if hasattr(obj, k)}
    for key, value in data.items():
        setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    registrar_log(db, user_id, "ACTUALIZAR_LECCION", "lecciones", id_leccion, valor_anterior=old_data, valor_nuevo=data)
    return obj

def delete_leccion(db: Session, id_leccion: int, user_id: int):
    obj = db.query(models.Leccion).filter(models.Leccion.id_leccion == id_leccion).first()
    if not obj: return None
    obj.id_estado = 0
    db.commit()
    registrar_log(db, user_id, "BORRAR_LECCION", "lecciones", id_leccion)
    return True

def list_lecciones(db: Session, id_curso: int):
    return db.query(models.Leccion).filter(models.Leccion.id_curso == id_curso).order_by(models.Leccion.orden).all()

def list_tareas_leccion(db: Session, id_leccion: int):
    return db.query(models.Tarea).filter(models.Tarea.id_leccion == id_leccion).all()

# --- TAREAS ---
def create_tarea(db: Session, data: schema.TareaCreate, user_id: int):
    obj = models.Tarea(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, user_id, "CREAR_TAREA", "tareas", obj.id_tarea, valor_nuevo=data.model_dump())
    return obj

def update_tarea(db: Session, id_tarea: int, data: dict, user_id: int):
    obj = db.query(models.Tarea).filter(models.Tarea.id_tarea == id_tarea).first()
    if not obj: return None
    
    old_data = {k: getattr(obj, k) for k in data.keys() if hasattr(obj, k)}
    for key, value in data.items():
        setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    registrar_log(db, user_id, "ACTUALIZAR_TAREA", "tareas", id_tarea, valor_anterior=old_data, valor_nuevo=data)
    return obj

def delete_tarea(db: Session, id_tarea: int, user_id: int):
    obj = db.query(models.Tarea).filter(models.Tarea.id_tarea == id_tarea).first()
    if not obj: return None
    obj.id_estado = 0
    db.commit()
    registrar_log(db, user_id, "BORRAR_TAREA", "tareas", id_tarea)
    return True

# --- ENTREGAS ---
def list_entregas_tarea(db: Session, id_tarea: int):
    return db.query(models.EntregaTarea).filter(models.EntregaTarea.id_tarea == id_tarea).all()

def submit_tarea(db: Session, data: schema.EntregaTareaCreate, user_id: int):
    existente = db.query(models.EntregaTarea).filter(
        models.EntregaTarea.id_tarea == data.id_tarea,
        models.EntregaTarea.id_usuario == user_id
    ).first()
    
    if existente:
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
    
    db.commit()
    db.refresh(obj)
    registrar_log(db, admin_id, "CALIFICAR_TAREA", "entregas_tareas", id_entrega, valor_anterior={"nota": old_nota}, valor_nuevo={"nota": data.nota})
    return obj

# --- FOROS ---
def create_post_foro(db: Session, data: schema.PostForoCreate, user_id: int):
    obj = models.PostForo(**data.model_dump(), id_usuario=user_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def list_posts_foro(db: Session, id_curso: int):
    return db.query(models.PostForo).filter(models.PostForo.id_curso == id_curso).order_by(models.PostForo.fecha_creacion.desc()).all()
