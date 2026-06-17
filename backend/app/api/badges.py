from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import badge as badge_schema
from ..services import badge_service
from .auth import get_current_user
from ..models import models
from ..core.permissions import ensure_permission, PERMISSION_BADGES_MANAGE

router = APIRouter(
    prefix="/insignias",
    tags=["insignias"]
)

@router.get("/", response_model=List[badge_schema.BadgeResponse])
def read_badges(db: Session = Depends(get_db)):
    return badge_service.get_all_badges(db)

@router.post("/", response_model=badge_schema.BadgeResponse)
def create_badge(
    badge: badge_schema.BadgeCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_BADGES_MANAGE)
    return badge_service.create_badge(db, badge, current_user.id_usuario)

@router.put("/{id_badge}", response_model=badge_schema.BadgeResponse)
def update_badge(
    id_badge: int,
    badge: badge_schema.BadgeUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_BADGES_MANAGE)
    updated = badge_service.update_badge(db, id_badge, badge, current_user.id_usuario)
    if not updated:
        raise HTTPException(status_code=404, detail="Insignia no encontrada")
    return updated

@router.delete("/{id_badge}")
def delete_badge(
    id_badge: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_BADGES_MANAGE)
    success = badge_service.delete_badge(db, id_badge, current_user.id_usuario)
    if not success:
        raise HTTPException(status_code=404, detail="Insignia no encontrada")
    return {"message": "Insignia eliminada correctamente"}

@router.get("/usuario/{id_usuario}", response_model=List[badge_schema.BadgeResponse])
def read_user_badges(id_usuario: int, db: Session = Depends(get_db)):
    return badge_service.get_user_badges(db, id_usuario)

@router.post("/asignar", response_model=badge_schema.UsuarioBadgeResponse)
def assign_badge(
    id_usuario: int,
    id_badge: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_BADGES_MANAGE)
    return badge_service.assign_badge_to_user(db, id_usuario, id_badge, current_user.id_usuario)
