import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import pago as pago_schema
from ..core.logging import registrar_log
from .auth import get_current_user
from datetime import datetime
from decimal import Decimal

router = APIRouter(
    prefix="/pagos",
    tags=["pagos"]
)

# Directorio para subir comprobantes (simulado)
UPLOAD_DIR = "static/comprobantes"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-comprobante", response_model=pago_schema.PagoResponse)
async def upload_comprobante(
    request: Request,
    id_referencia: int = Form(...),
    tipo_referencia: str = Form(...),
    monto: Decimal = Form(...),
    metodo_pago: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Simular guardado de archivo
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"comprobante_{current_user.id_usuario}_{datetime.now().timestamp()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Crear registro de pago
    nuevo_pago = models.Pago(
        id_usuario=current_user.id_usuario,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        comprobante_url=file_path,
        estado_pago="PENDIENTE",
        fecha_pago=datetime.utcnow()
    )
    
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    
    # Si es una inscripción a evento, actualizar el id_pago en la inscripción (si aplica)
    if tipo_referencia == "EVENTO":
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == current_user.id_usuario,
            models.InscripcionEvento.id_evento == id_referencia
        ).first()
        if inscripcion:
            inscripcion.id_pago = nuevo_pago.id_pago
            db.commit()

    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="SUBIR_COMPROBANTE_PAGO",
        tabla_afectada="pagos",
        id_registro_afectado=nuevo_pago.id_pago,
        valor_nuevo={"referencia": id_referencia, "monto": str(monto)},
        ip_direccion=request.client.host
    )
    
    return nuevo_pago

@router.get("/mis-pagos", response_model=List[pago_schema.PagoResponse])
def get_mis_pagos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return db.query(models.Pago).filter(models.Pago.id_usuario == current_user.id_usuario).all()

# --- ENDPOINTS ADMINISTRATIVOS ---

@router.get("/admin/todos", response_model=List[pago_schema.PagoResponse])
def get_todos_los_pagos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver todos los pagos")
    return db.query(models.Pago).order_by(models.Pago.fecha_pago.desc()).all()

@router.put("/admin/{id_pago}/validar", response_model=pago_schema.PagoResponse)
def validar_pago(
    request: Request,
    id_pago: int,
    pago_update: pago_schema.PagoUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para validar pagos")
    
    db_pago = db.query(models.Pago).filter(models.Pago.id_pago == id_pago).first()
    if not db_pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    # Actualizar estado del pago
    db_pago.estado_pago = pago_update.estado_pago
    db_pago.validado_por = current_user.id_usuario
    
    # Si se aprueba y es un evento, confirmar la inscripción automáticamente
    if pago_update.estado_pago == "APROBADO" and db_pago.tipo_referencia == "EVENTO":
        inscripcion = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == db_pago.id_usuario,
            models.InscripcionEvento.id_evento == db_pago.id_referencia
        ).first()
        if inscripcion:
            inscripcion.estado_inscripcion = "CONFIRMADA"
            inscripcion.fecha_validacion = datetime.utcnow()

    db.commit()
    db.refresh(db_pago)
    
    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion=f"VALIDAR_PAGO_{pago_update.estado_pago}",
        tabla_afectada="pagos",
        id_registro_afectado=id_pago,
        valor_nuevo={"estado": pago_update.estado_pago},
        ip_direccion=request.client.host
    )
    
    return db_pago
