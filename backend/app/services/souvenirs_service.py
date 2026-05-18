from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException
from ..models import models
from datetime import datetime

def list_productos(db: Session, categoria: Optional[str] = None):
    query = db.query(models.Producto)
    if categoria:
        query = query.filter(models.Producto.categoria == categoria)
    return query.all()

def create_producto(db: Session, data: dict, user_id: int):
    db_obj = models.Producto(**data, creado_por=user_id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_producto(db: Session, id_producto: int, data: dict, user_id: int):
    db_obj = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in data.items():
        setattr(db_obj, key, value)
    
    db_obj.modificado_por = user_id
    db_obj.fecha_modificacion = datetime.utcnow()
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_pedido(db: Session, id_usuario: int, items: List[dict], admin_id: int):
    """
    items: list of {"id_producto": int, "cantidad": int}
    """
    total = 0
    # 1. Validar Stock y calcular total
    detalles_db = []
    for item in items:
        prod = db.query(models.Producto).filter(models.Producto.id_producto == item["id_producto"]).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {item['id_producto']} no encontrado")
        
        if prod.stock < item["cantidad"]:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {prod.nombre}")
        
        # Descontar stock
        prod.stock -= item["cantidad"]
        
        precio_unitario = prod.precio
        total += precio_unitario * item["cantidad"]
        
        detalles_db.append(models.PedidoDetalle(
            id_producto=prod.id_producto,
            cantidad=item["cantidad"],
            precio_unitario=precio_unitario
        ))

    # 2. Crear Pedido
    db_pedido = models.Pedido(
        id_usuario=id_usuario,
        total=total,
        estado="COMPLETADO", # Como es registrado por admin, asumimos entrega inmediata o pago procesado
        creado_por=admin_id
    )
    db.add(db_pedido)
    db.flush() # Para obtener id_pedido

    # 3. Vincular detalles
    for det in detalles_db:
        det.id_pedido = db_pedido.id_pedido
        db.add(det)
    
    db.commit()
    db.refresh(db_pedido)
    return db_pedido

def list_pedidos(db: Session):
    return db.query(models.Pedido).order_by(models.Pedido.fecha_pedido.desc()).all()
