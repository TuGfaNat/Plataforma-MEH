import os
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..models import models
from ..schemas import pago as pago_schema
from ..core.logging import registrar_log
from ..core.permissions import (
    PERMISSION_PAYMENTS_READ_ALL,
    PERMISSION_PAYMENTS_VALIDATE,
    ensure_permission,
)


UPLOAD_DIR = "static/comprobantes"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)


async def upload_comprobante(
    db: Session,
    current_user: models.Usuario,
    id_referencia: int,
    tipo_referencia: str,
    monto: Decimal,
    metodo_pago: str,
    file: UploadFile,
    ip_address: Optional[str]
) -> models.Pago:
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"comprobante_{current_user.id_usuario}_{datetime.now().timestamp()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    with open(file_path, "wb") as output_file:
        output_file.write(await file.read())

    nuevo_pago = models.Pago(
        id_usuario=current_user.id_usuario,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        url_comprobante=file_path,
        estado_pago="PENDIENTE",
        fecha_pago=datetime.utcnow(),
        creado_por=current_user.id_usuario # MIXIN
    )
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)

    if tipo_referencia == "EVENTO":
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == current_user.id_usuario,
            models.InscripcionEvento.id_evento == id_referencia
        ).first()
        if inscripcion:
            inscripcion.id_pago = nuevo_pago.id_pago
            db.commit()

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="SUBIR_COMPROBANTE_PAGO",
        tabla_afectada="pagos",
        id_registro_afectado=nuevo_pago.id_pago,
        valor_nuevo={"referencia": id_referencia, "monto": str(monto)},
        ip_direccion=ip_address
    )
    return nuevo_pago


def list_mis_pagos(db: Session, current_user: models.Usuario) -> List[models.Pago]:
    return db.query(models.Pago).filter(models.Pago.id_usuario == current_user.id_usuario).all()


def list_todos_pagos(db: Session, current_user: models.Usuario) -> List[models.Pago]:
    ensure_permission(current_user.rol, PERMISSION_PAYMENTS_READ_ALL, "No tienes permisos para ver todos los pagos")
    return db.query(models.Pago).order_by(models.Pago.fecha_pago.desc()).all()


def validar_pago(
    db: Session,
    current_user: models.Usuario,
    id_pago: int,
    pago_update: pago_schema.PagoUpdate,
    ip_address: Optional[str]
) -> models.Pago:
    ensure_permission(current_user.rol, PERMISSION_PAYMENTS_VALIDATE, "No tienes permisos para validar pagos")

    db_pago = db.query(models.Pago).filter(models.Pago.id_pago == id_pago).first()
    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    db_pago.estado_pago = pago_update.estado_pago
    db_pago.validado_por = current_user.id_usuario
    
    # MIXIN AUDITORIA
    db_pago.modificado_por = current_user.id_usuario
    db_pago.fecha_modificacion = datetime.utcnow()

    if pago_update.estado_pago == "APROBADO" and db_pago.tipo_referencia == "EVENTO":
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == db_pago.id_usuario,
            models.InscripcionEvento.id_evento == db_pago.id_referencia
        ).first()
        if inscripcion:
            inscripcion.estado_inscripcion = "CONFIRMADA"
            inscripcion.fecha_validacion = datetime.utcnow()
            # Auditoría también en la inscripción
            inscripcion.modificado_por = current_user.id_usuario
            inscripcion.fecha_modificacion = datetime.utcnow()

    db.commit()
    db.refresh(db_pago)

    # NOTIFICACION EMAIL
    from . import email_service
    actividad_nombre = db_pago.tipo_referencia
    email_service.notify_pago_actualizado(db_pago.usuario.correo, db_pago.usuario.nombres, db_pago.estado_pago, actividad_nombre)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion=f"VALIDAR_PAGO_{pago_update.estado_pago}",
        tabla_afectada="pagos",
        id_registro_afectado=id_pago,
        valor_nuevo={"estado": pago_update.estado_pago},
        ip_direccion=ip_address
    )
    return db_pago
