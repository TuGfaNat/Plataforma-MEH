from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from .auth import get_current_user
from ..core.permissions import ensure_admin
from ..services import logs_service

router = APIRouter(
    prefix="/logs",
    tags=["logs"]
)

@router.get("/", response_model=List[dict])
def get_logs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_admin(current_user.rol, "Solo los administradores pueden ver los logs")
    return logs_service.get_logs_auditoria(db, current_user, skip, limit)
