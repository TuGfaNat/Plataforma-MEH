from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException
from ..models import models
from datetime import datetime
from ..core.logging import registrar_log

def get_producto(db: Session, id_producto: int):
    prod = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not prod or prod.id_estado == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod

def list_productos(db: Session, categoria: Optional[str] = None):
    query = db.query(models.Producto).filter(models.Producto.id_estado != 0)
    if categoria:
        query = query.filter(models.Producto.categoria == categoria)
    return query.order_by(models.Producto.id_producto.desc()).all()

def create_producto(db: Session, data: dict, user_id: int):
    # Sincronizar id_estado y activo
    if 'id_estado' in data and data['id_estado'] is not None:
        data['activo'] = (data['id_estado'] == 2)
    elif 'activo' in data and data['activo'] is not None:
        data['id_estado'] = 2 if data['activo'] else 1

    clean_data = {k: v for k, v in data.items() if hasattr(models.Producto, k)}
    db_obj = models.Producto(**clean_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    registrar_log(
        db=db,
        id_admin=user_id,
        accion="CREAR_PRODUCTO_SOUVENIR",
        tabla_afectada="productos",
        id_registro_afectado=db_obj.id_producto,
        valor_nuevo=clean_data
    )
    return db_obj

def update_producto(db: Session, id_producto: int, data: dict, user_id: int):
    db_obj = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Sincronizar id_estado y activo bidireccionalmente
    if 'id_estado' in data and data['id_estado'] is not None:
        data['activo'] = (data['id_estado'] == 2)
    elif 'activo' in data and data['activo'] is not None:
        data['id_estado'] = 2 if data['activo'] else 1

    valor_anterior = {k: getattr(db_obj, k) for k in data.keys() if hasattr(db_obj, k)}
    
    for key, value in data.items():
        if hasattr(db_obj, key):
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

def format_pedido_response(pedido: models.Pedido):
    detalles_res = []
    for d in (pedido.detalles or []):
        detalles_res.append({
            "id_detalle": d.id_detalle,
            "id_producto": d.id_producto,
            "cantidad": d.cantidad,
            "precio_unitario": d.precio_unitario,
            "producto_nombre": d.producto.nombre if d.producto else None,
            "producto_imagen": d.producto.imagen_url if d.producto else None
        })
    
    usuario_nombre = None
    usuario_correo = None
    if pedido.usuario:
        usuario_nombre = f"{pedido.usuario.nombres} {pedido.usuario.apellidos}".strip()
        usuario_correo = pedido.usuario.correo

    evento_titulo = None
    if pedido.evento:
        evento_titulo = pedido.evento.titulo

    metodo_pago = pedido.pago.metodo_pago if pedido.pago else "EFECTIVO"

    return {
        "id_pedido": pedido.id_pedido,
        "id_usuario": pedido.id_usuario,
        "usuario_nombre": usuario_nombre,
        "usuario_correo": usuario_correo,
        "id_evento": pedido.id_evento,
        "evento_titulo": evento_titulo,
        "metodo_pago": metodo_pago,
        "total": pedido.total,
        "estado": pedido.estado,
        "fecha_pedido": pedido.fecha_pedido,
        "detalles": detalles_res
    }

def create_pedido(
    db: Session, 
    id_usuario: int, 
    items: List[dict], 
    admin_id: int, 
    metodo_pago: str = "EFECTIVO", 
    ip: str = None,
    id_evento: Optional[int] = None,
    notas: Optional[str] = None
):
    """
    Registra la venta o asignación manual de souvenirs por Admin u Organizador.
    Deduce el stock de cada producto en la base de datos, crea el Pago pagado (COMPLETADO),
    el Pedido vinculado opcionalmente al Evento, y sus detalles.
    """
    total = 0
    detalles_db = []
    log_items = []

    # Validar evento si fue enviado
    evento_obj = None
    if id_evento:
        evento_obj = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
        if not evento_obj:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
            
    # Validar usuario comprador
    comprador = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not comprador:
        raise HTTPException(status_code=404, detail="Usuario comprador no encontrado")
    
    # 1. Validar Stock y calcular total
    for item in items:
        prod = db.query(models.Producto).filter(models.Producto.id_producto == item["id_producto"]).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {item['id_producto']} no encontrado")
        
        if prod.stock < item["cantidad"] and metodo_pago not in ("CORTESIA", "CORRECCION", "AJUSTE"):
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {prod.nombre} (disponible: {prod.stock})")
        
        # Descontar stock automáticamente en base de datos (sin dejarlo negativo si es cortesía/ajuste)
        prod.stock = max(0, prod.stock - item["cantidad"])
        
        precio_unitario = prod.precio
        subtotal = precio_unitario * item["cantidad"]
        total += subtotal
        
        detalles_db.append(models.PedidoDetalle(
            id_producto=prod.id_producto,
            cantidad=item["cantidad"],
            precio_unitario=precio_unitario
        ))
        log_items.append({"id_producto": prod.id_producto, "nombre": prod.nombre, "cantidad": item["cantidad"], "subtotal": float(subtotal)})

    # 2. Crear el registro de PAGO asociado (COMPLETADO)
    db_pago = models.Pago(
        id_usuario=id_usuario,
        monto=total,
        metodo_pago=metodo_pago,
        estado_pago="COMPLETADO", # Como es venta presencial directa por admin u organizador, se marca pagado
        id_referencia=id_evento if id_evento else 0, # Evento donde se vendió o 0
        tipo_referencia="SOUVENIR",
        validado_por=admin_id,
        fecha_validacion=datetime.utcnow(),
        notas_admin=notas or (f"Venta en evento: {evento_obj.titulo}" if evento_obj else "Venta presencial de souvenirs"),
        creado_por=admin_id
    )
    db.add(db_pago)
    db.flush()

    # 3. Crear Pedido vinculado al Pago y al Evento
    db_pedido = models.Pedido(
        id_usuario=id_usuario,
        id_pago=db_pago.id_pago,
        id_evento=id_evento,
        total=total,
        estado="COMPLETADO",
        fecha_pedido=datetime.utcnow(),
        creado_por=admin_id
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
            "comprador": f"{comprador.nombres} {comprador.apellidos}",
            "metodo_pago": metodo_pago,
            "id_evento": id_evento,
            "evento": evento_obj.titulo if evento_obj else None,
            "total": float(total),
            "items": log_items
        },
        ip_direccion=ip
    )
    
    return format_pedido_response(db_pedido)

def list_pedidos(db: Session, id_evento: Optional[int] = None):
    query = db.query(models.Pedido)
    if id_evento:
        query = query.filter(models.Pedido.id_evento == id_evento)
    pedidos = query.order_by(models.Pedido.fecha_pedido.desc()).all()
    return [format_pedido_response(p) for p in pedidos]
