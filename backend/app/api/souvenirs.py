from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..services import souvenirs_service
from .auth import get_current_user
from ..core.permissions import ensure_permission, PERMISSION_EVENTS_MANAGE

router = APIRouter(
    prefix="/souvenirs",
    tags=["souvenirs"]
)

@router.get("/")
def get_productos(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    return souvenirs_service.list_productos(db, categoria)

@router.post("/")
def create_producto(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.create_producto(db, data, current_user.id_usuario)

@router.put("/{id_producto}")
def update_producto(
    id_producto: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.update_producto(db, id_producto, data, current_user.id_usuario)

@router.post("/ventas")
def register_venta(
    id_usuario: int,
    items: List[dict],
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.create_pedido(db, id_usuario, items, current_user.id_usuario)

@router.get("/ventas")
def get_ventas(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.list_pedidos(db)
