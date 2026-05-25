from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException
from ..models import models
from datetime import datetime
from ..core.logging import registrar_log

def list_productos(db: Session, categoria: Optional[str] = None):
    query = db.query(models.Producto)
    if categoria:
        query = query.filter(models.Producto.categoria == categoria)
    return query.all()

def create_producto(db: Session, data: dict, user_id: int):
    db_obj = models.Producto(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    registrar_log(
        db=db,
        id_admin=user_id,
        accion="CREAR_PRODUCTO_SOUVENIR",
        tabla_afectada="productos",
        id_registro_afectado=db_obj.id_producto,
        valor_nuevo=data
    )
    return db_obj

def update_producto(db: Session, id_producto: int, data: dict, user_id: int):
    db_obj = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    valor_anterior = {k: getattr(db_obj, k) for k in data.keys() if hasattr(db_obj, k)}
    
    for key, value in data.items():
        setattr(db_obj, key, value)
    
    db.commit()
    db.refresh(db_obj)
    
    registrar_log(
        db=db,
        id_admin=user_id,
        accion="ACTUALIZAR_PRODUCTO_SOUVENIR",
        tabla_afectada="productos",
        id_registro_afectado=id_producto,
        valor_anterior=valor_anterior,
        valor_nuevo=data
    )
    return db_obj

def delete_producto(db: Session, id_producto: int, user_id: int):
    db_obj = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    nombre_prod = db_obj.nombre
    db_obj.id_estado = 0
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=user_id,
        accion="BORRAR_PRODUCTO_SOUVENIR",
        tabla_afectada="productos",
        id_registro_afectado=id_producto,
        valor_anterior={"nombre": nombre_prod}
    )
    return {"message": "Producto eliminado"}

def create_pedido(db: Session, id_usuario: int, items: List[dict], admin_id: int, metodo_pago: str = "EFECTIVO", ip: str = None):
    """
    items: list of {"id_producto": int, "cantidad": int}
    """
    total = 0
    detalles_db = []
    log_items = []
    
    # 1. Validar Stock y calcular total
    for item in items:
        prod = db.query(models.Producto).filter(models.Producto.id_producto == item["id_producto"]).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {item['id_producto']} no encontrado")
        
        if prod.stock < item["cantidad"]:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {prod.nombre}")
        
        # Descontar stock automáticamente
        prod.stock -= item["cantidad"]
        
        precio_unitario = prod.precio
        subtotal = precio_unitario * item["cantidad"]
        total += subtotal
        
        detalles_db.append(models.PedidoDetalle(
            id_producto=prod.id_producto,
            cantidad=item["cantidad"],
            precio_unitario=precio_unitario
        ))
        log_items.append({"nombre": prod.nombre, "cantidad": item["cantidad"], "subtotal": float(subtotal)})

    # 2. Crear el registro de PAGO asociado
    db_pago = models.Pago(
        id_usuario=id_usuario,
        monto=total,
        metodo_pago=metodo_pago,
        estado_pago="COMPLETADO", # Como es venta directa por admin, asumimos pagado
        id_referencia=0, # Venta manual
        tipo_referencia="SOUVENIR",
        validado_por=admin_id,
        fecha_validacion=datetime.utcnow()
    )
    db.add(db_pago)
    db.flush()

    # 3. Crear Pedido vinculado al Pago
    db_pedido = models.Pedido(
        id_usuario=id_usuario,
        id_pago=db_pago.id_pago,
        total=total,
        estado="COMPLETADO",
        fecha_pedido=datetime.utcnow()
    )
    db.add(db_pedido)
    db.flush() 

    # 4. Vincular detalles
    for det in detalles_db:
        det.id_pedido = db_pedido.id_pedido
        db.add(det)
    
    db.commit()
    db.refresh(db_pedido)
    
    # 5. Registrar en Auditoría (Trazabilidad financiera total)
    registrar_log(
        db=db,
        id_admin=admin_id,
        accion="REGISTRO_VENTA_POS",
        tabla_afectada="pedidos",
        id_registro_afectado=db_pedido.id_pedido,
        valor_nuevo={
            "comprador_id": id_usuario,
            "metodo_pago": metodo_pago,
            "total": float(total),
            "items": log_items
        },
        ip_direccion=ip
    )
    
    return db_pedido

def list_pedidos(db: Session):
    return db.query(models.Pedido).order_by(models.Pedido.fecha_pedido.desc()).all()
