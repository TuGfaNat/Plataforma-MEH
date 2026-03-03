from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import evento as evento_schema
from ..core.logging import registrar_log
from .auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/eventos",
    tags=["eventos"]
)

@router.post("/", response_model=evento_schema.EventoResponse)
def create_evento(
    request: Request,
    evento: evento_schema.EventoCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Solo ADMIN u ORGANIZADOR pueden crear eventos
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear eventos")
        
    db_evento = models.Evento(**evento.model_dump(), creado_por=current_user.id_usuario)
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    
    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=db_evento.id_evento,
        valor_nuevo=evento.model_dump(),
        ip_direccion=request.client.host
    )
    
    return db_evento

@router.get("/", response_model=List[evento_schema.EventoResponse])
def get_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Evento).offset(skip).limit(limit).all()

@router.get("/{id_evento}", response_model=evento_schema.EventoResponse)
def get_evento(id_evento: int, db: Session = Depends(get_db)):
    db_evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return db_evento

@router.put("/{id_evento}", response_model=evento_schema.EventoResponse)
def update_evento(
    request: Request,
    id_evento: int, 
    evento: evento_schema.EventoUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar eventos")

    db_evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Capturar valor anterior para el log
    valor_anterior = {
        "titulo": db_evento.titulo,
        "estado": db_evento.estado,
        "capacidad_max": db_evento.capacidad_max
    }

    update_data = evento.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_evento, key, value)
    
    db_evento.modificado_por = current_user.id_usuario
    db.commit()
    db.refresh(db_evento)
    
    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ACTUALIZAR_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_anterior=valor_anterior,
        valor_nuevo=update_data,
        ip_direccion=request.client.host
    )
    
    return db_evento

@router.post("/{id_evento}/asistencia-qr")
def registrar_asistencia_qr(
    id_evento: int,
    request: Request,
    token_qr: str,
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Solo ORGANIZADOR o ADMIN pueden escanear
    if current_user.rol not in ["ADMIN", "ORGANIZADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para registrar asistencia")
    
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento or evento.token_qr != token_qr:
        raise HTTPException(status_code=400, detail="Token QR inválido para este evento")
    
    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == id_usuario,
        models.InscripcionEvento.id_evento == id_evento
    ).first()
    
    if not inscripcion:
        raise HTTPException(status_code=404, detail="El usuario no está inscrito en este evento")
    
    inscripcion.asistio = True
    inscripcion.fecha_validacion = datetime.utcnow()
    db.commit()
    
    return {"message": "Asistencia registrada con éxito", "usuario": id_usuario}
