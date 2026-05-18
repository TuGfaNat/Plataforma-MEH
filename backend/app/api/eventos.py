from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import evento as evento_schema
from ..services import eventos_service
from .auth import get_current_user

router = APIRouter(
    prefix="/eventos",
    tags=["eventos"]
)

@router.post("/", response_model=evento_schema.EventoResponse, status_code=status.HTTP_201_CREATED)
def create_evento(
    request: Request,
    evento: evento_schema.EventoCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Crea un nuevo evento (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.create_evento(db, current_user, evento, ip_address)

@router.get("/", response_model=List[evento_schema.EventoResponse])
def get_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos los eventos disponibles."""
    return eventos_service.list_eventos(db, skip, limit)

@router.get("/{id_evento}", response_model=evento_schema.EventoResponse)
def get_evento(id_evento: int, db: Session = Depends(get_db)):
    """Obtiene los detalles de un evento específico."""
    return eventos_service.get_evento_by_id(db, id_evento)

@router.put("/{id_evento}", response_model=evento_schema.EventoResponse)
def update_evento(
    request: Request,
    id_evento: int, 
    evento: evento_schema.EventoUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza la información de un evento (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.update_evento(db, current_user, id_evento, evento, ip_address)

@router.post("/asistencia-qr")
def registrar_asistencia_qr(
    request: Request,
    codigo_qr: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Registra asistencia mediante el escaneo de un código QR."""
    ip_address = request.client.host if request.client else None
    return eventos_service.registrar_asistencia_qr(db, current_user, codigo_qr, ip_address)

@router.post("/{id_evento}/asistencia-qr")
def registrar_asistencia_qr_legacy(
    id_evento: int,
    request: Request,
    token_qr: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Compatibilidad legacy para el frontend anterior."""
    _ = id_evento
    ip_address = request.client.host if request.client else None
    return eventos_service.registrar_asistencia_qr(db, current_user, token_qr, ip_address)
