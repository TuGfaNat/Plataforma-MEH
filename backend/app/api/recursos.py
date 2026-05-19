from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import recurso as recurso_schema
from ..services import recurso_service
from .auth import get_current_user

router = APIRouter(prefix="/recursos", tags=["recursos"])

@router.get("/", response_model=List[recurso_schema.RecursoResponse])
def get_recursos(
    categoria: Optional[str] = Query(None),
    id_curso: Optional[int] = Query(None),
    id_evento: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    query = db.query(models.Recurso)
    if categoria:
        query = query.filter(models.Recurso.categoria == categoria)
    if id_curso:
        query = query.filter(models.Recurso.id_curso == id_curso)
    if id_evento:
        query = query.filter(models.Recurso.id_evento == id_evento)
    return query.order_by(models.Recurso.fecha_creacion.desc()).all()

@router.post("/", response_model=recurso_schema.RecursoResponse, status_code=status.HTTP_201_CREATED)
def create_recurso(
    request: Request,
    recurso: recurso_schema.RecursoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return recurso_service.create_recurso(db, current_user, recurso, ip)

@router.put("/{id_recurso}", response_model=recurso_schema.RecursoResponse)
def update_recurso(
    id_recurso: int,
    request: Request,
    recurso_update: recurso_schema.RecursoUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    return recurso_service.update_recurso(db, current_user, id_recurso, recurso_update, ip)

@router.delete("/{id_recurso}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurso(
    id_recurso: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip = request.client.host if request.client else None
    recurso_service.delete_recurso(db, current_user, id_recurso, ip)
    return None
