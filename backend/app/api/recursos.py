from fastapi import APIRouter, Depends, Query
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
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return recurso_service.list_recursos(db, categoria)

@router.post("/", response_model=recurso_schema.RecursoResponse)
def create_recurso(
    recurso: recurso_schema.RecursoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return recurso_service.create_recurso(db, current_user, recurso)

@router.delete("/{id_recurso}")
def delete_recurso(
    id_recurso: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return recurso_service.delete_recurso(db, current_user, id_recurso)
