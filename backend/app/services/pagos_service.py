import os
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models import models
from ..schemas import pago as pago_schema
from ..core.logging import registrar_log
from ..core.exceptions import (
    RecursoNoEncontradoError,
    PermisoDenegadoError,
    ValidacionNegocioError
)
from ..core.permissions import (
    PERMISSION_PAYMENTS_READ_ALL,
    PERMISSION_PAYMENTS_VALIDATE,
    has_permission,
)

UPLOAD_DIR = "static/comprobantes"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_comprobante_upload(
    db: Session,
    user_id: int,
    id_referencia: int,
    tipo_referencia: str,
    monto: Decimal,
    metodo_pago: str,
    file_content: bytes,
    file_extension: str,
    ip_address: Optional[str] = None
) -> models.Pago:
    """Procesa la subida física del comprobante y registra el pago en la DB."""
    file_name = f"comprobante_{user_id}_{datetime.now().timestamp()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as output_file:
        output_file.write(file_content)

    nuevo_pago = models.Pago(
        id_usuario=user_id,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        url_comprobante=file_path,
        estado_pago="PENDIENTE",
        fecha_pago=datetime.utcnow(),
        creado_por=user_id,
        fecha_creacion=datetime.utcnow()
    )
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)

    # Vincular automáticamente a la inscripción si es un evento
    if tipo_referencia == "EVENTO":
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == user_id,
            models.InscripcionEvento.id_evento == id_referencia
        ).first()
        if inscripcion:
            inscripcion.id_pago = nuevo_pago.id_pago
            db.commit()

    registrar_log(
        db=db,
        id_admin=user_id,
        accion="SUBIR_COMPROBANTE_PAGO",
        tabla_afectada="pagos",
        id_registro_afectado=nuevo_pago.id_pago,
        valor_nuevo={"referencia": id_referencia, "monto": str(monto)},
        ip_direccion=ip_address
    )
    return nuevo_pago

def list_mis_pagos(db: Session, user_id: int) -> List[models.Pago]:
    """Obtiene el historial de pagos de un usuario."""
    return db.query(models.Pago).filter(models.Pago.id_usuario == user_id).all()

def list_todos_pagos(db: Session, admin_role: str) -> List[models.Pago]:
    """Lista todos los pagos del sistema (Solo Staff autorizado)."""
    if not has_permission(admin_role, PERMISSION_PAYMENTS_READ_ALL):
        raise PermisoDenegadoError("No tienes permisos para ver todos los pagos")
    return db.query(models.Pago).order_by(models.Pago.fecha_pago.desc()).all()

def validar_pago(
    db: Session,
    admin_user: models.Usuario,
    id_pago: int,
    pago_update: pago_schema.PagoUpdate,
    ip_address: Optional[str] = None
) -> models.Pago:
    """Aprueba o rechaza un pago y actualiza la inscripción vinculada (Solo Staff)."""
    if not has_permission(admin_user.rol, PERMISSION_PAYMENTS_VALIDATE):
        raise PermisoDenegadoError("No tienes permisos para validar pagos")

    db_pago = db.query(models.Pago).filter(models.Pago.id_pago == id_pago).first()
    if not db_pago:
        raise RecursoNoEncontradoError("Pago no encontrado")

    db_pago.estado_pago = pago_update.estado_pago
    db_pago.validado_por = admin_user.id_usuario
    db_pago.fecha_validacion = datetime.utcnow()
    db_pago.notas_admin = pago_update.notas_admin
    
    db_pago.modificado_por = admin_user.id_usuario
    db_pago.fecha_modificacion = datetime.utcnow()

    # Si se aprueba un pago de EVENTO, confirmar la inscripción y asegurar el QR
    if pago_update.estado_pago == "APROBADO" and db_pago.tipo_referencia == "EVENTO":
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == db_pago.id_usuario,
            models.InscripcionEvento.id_evento == db_pago.id_referencia
        ).first()
        if inscripcion:
            inscripcion.estado_inscripcion = "CONFIRMADA"
            inscripcion.fecha_validacion = datetime.utcnow()
            
            if not inscripcion.codigo_qr:
                inscripcion.codigo_qr = str(uuid.uuid4())
                
            inscripcion.modificado_por = admin_user.id_usuario
            inscripcion.fecha_modificacion = datetime.utcnow()

    db.commit()
    db.refresh(db_pago)

    # Notificación (Manejada con precaución de errores)
    try:
        from . import email_service
        email_service.notify_pago_actualizado(
            db_pago.usuario.correo, 
            db_pago.usuario.nombres, 
            db_pago.estado_pago, 
            db_pago.tipo_referencia
        )
        if pago_update.estado_pago == "APROBADO" and db_pago.tipo_referencia == "EVENTO" and inscripcion:
            email_service.notify_ticket_qr(
                email=db_pago.usuario.correo,
                nombre=db_pago.usuario.nombres,
                titulo_evento=inscripcion.evento.titulo,
                fecha=str(inscripcion.evento.fecha_inicio.date()) if inscripcion.evento.fecha_inicio else "",
                codigo_qr=inscripcion.codigo_qr,
                frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
            )
    except Exception:
        pass

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion=f"VALIDAR_PAGO_{pago_update.estado_pago}",
        tabla_afectada="pagos",
        id_registro_afectado=id_pago,
        valor_nuevo={"estado": pago_update.estado_pago},
        ip_direccion=ip_address
    )
    return db_pago
