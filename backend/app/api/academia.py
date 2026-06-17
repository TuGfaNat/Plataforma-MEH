from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import curso as schema
from ..services import academia_service
from .auth import get_current_user
from ..core.permissions import ensure_permission, PERMISSION_COURSES_MANAGE

router = APIRouter(prefix="/academia", tags=["academia"])

# --- LECCIONES ---
@router.get("/cursos/{id_curso}/lecciones", response_model=List[schema.LeccionResponse])
def get_lecciones(id_curso: int, db: Session = Depends(get_db)):
    return academia_service.list_lecciones(db, id_curso)

@router.post("/lecciones", response_model=schema.LeccionResponse, status_code=status.HTTP_201_CREATED)
def create_leccion(data: schema.LeccionCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    return academia_service.create_leccion(db, data, current_user.id_usuario)

@router.put("/lecciones/{id_leccion}", response_model=schema.LeccionResponse)
def update_leccion(id_leccion: int, data: dict, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    return academia_service.update_leccion(db, id_leccion, data, current_user.id_usuario)

@router.delete("/lecciones/{id_leccion}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leccion(id_leccion: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    academia_service.delete_leccion(db, id_leccion, current_user.id_usuario)
    return None

@router.get("/lecciones/{id_leccion}/tareas", response_model=List[schema.TareaResponse])
def get_tareas_leccion(id_leccion: int, db: Session = Depends(get_db)):
    return academia_service.list_tareas_leccion(db, id_leccion)

# --- TAREAS ---
@router.post("/tareas", response_model=schema.TareaResponse, status_code=status.HTTP_201_CREATED)
def create_tarea(data: schema.TareaCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    return academia_service.create_tarea(db, data, current_user.id_usuario)

@router.put("/tareas/{id_tarea}", response_model=schema.TareaResponse)
def update_tarea(id_tarea: int, data: dict, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    return academia_service.update_tarea(db, id_tarea, data, current_user.id_usuario)

@router.delete("/tareas/{id_tarea}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tarea(id_tarea: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    academia_service.delete_tarea(db, id_tarea, current_user.id_usuario)
    return None

# --- ENTREGAS ---
@router.get("/tareas/{id_tarea}/entregas", response_model=List[schema.EntregaTareaResponse])
def get_entregas_tarea(id_tarea: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    return academia_service.list_entregas_tarea(db, id_tarea)

@router.post("/tareas/entregar", response_model=schema.EntregaTareaResponse)
def submit_tarea(data: schema.EntregaTareaCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return academia_service.submit_tarea(db, data, current_user.id_usuario)

@router.put("/entregas/{id_entrega}/calificar", response_model=schema.EntregaTareaResponse)
def calificar_entrega(id_entrega: int, data: schema.EntregaTareaCalificar, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    ensure_permission(current_user.rol, PERMISSION_COURSES_MANAGE)
    return academia_service.calificar_entrega(db, id_entrega, data, current_user.id_usuario)

# --- FOROS ---
@router.get("/cursos/{id_curso}/foro", response_model=List[schema.PostForoResponse])
def get_foro(id_curso: int, db: Session = Depends(get_db)):
    return academia_service.list_posts_foro(db, id_curso)

@router.post("/foro", response_model=schema.PostForoResponse)
def create_post(data: schema.PostForoCreate, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return academia_service.create_post_foro(db, data, current_user.id_usuario)
