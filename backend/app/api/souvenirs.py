from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..services import souvenirs_service
from ..schemas import producto as schema
from .auth import get_current_user
from ..core.permissions import ensure_permission, PERMISSION_EVENTS_MANAGE

router = APIRouter(
    prefix="/souvenirs",
    tags=["souvenirs"]
)

@router.get("/", response_model=List[schema.ProductoResponse])
def get_productos(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    return souvenirs_service.list_productos(db, categoria)

@router.post("/", response_model=schema.ProductoResponse, status_code=status.HTTP_201_CREATED)
def create_producto(
    data: schema.ProductoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.create_producto(db, data.model_dump(), current_user.id_usuario)

@router.put("/{id_producto}", response_model=schema.ProductoResponse)
def update_producto(
    id_producto: int,
    data: schema.ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.update_producto(db, id_producto, data.model_dump(exclude_unset=True), current_user.id_usuario)

@router.delete("/{id_producto}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    souvenirs_service.delete_producto(db, id_producto, current_user.id_usuario)
    return None

@router.post("/ventas", response_model=schema.PedidoResponse)
def register_venta(
    request: Request,
    data: schema.VentaRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    ip = request.client.host if request.client else None
    return souvenirs_service.create_pedido(db, data.id_usuario, [item.model_dump() for item in data.items], current_user.id_usuario, data.metodo_pago, ip)

@router.get("/ventas", response_model=List[schema.PedidoResponse])
def get_ventas(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "Acceso denegado")
    return souvenirs_service.list_pedidos(db)
