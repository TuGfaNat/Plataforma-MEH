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
    prefix="/inscripciones",
    tags=["inscripciones"]
)

@router.post("/eventos/{id_evento}", response_model=evento_schema.InscripcionEventoResponse)
def inscribir_evento(
    id_evento: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # 1. Verificar si el evento existe
    evento = db.query(models.Evento).filter(models.Evento.id_evento == id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # 2. Verificar si ya está inscrito
    inscripcion_existente = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == current_user.id_usuario,
        models.InscripcionEvento.id_evento == id_evento
    ).first()
    if inscripcion_existente:
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este evento")
    
    # 3. Verificar capacidad
    conteo_inscritos = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_evento == id_evento
    ).count()
    if conteo_inscritos >= evento.capacidad_max:
        raise HTTPException(status_code=400, detail="El evento ha alcanzado su capacidad máxima")
    
    # 4. Crear inscripción
    nueva_inscripcion = models.InscripcionEvento(
        id_usuario=current_user.id_usuario,
        id_evento=id_evento,
        fecha_inscripcion=datetime.utcnow(),
        estado_inscripcion="PENDIENTE" # Por defecto hasta que se valide el pago si aplica
    )
    
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)
    
    # 5. Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="INSCRIBIR_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=nueva_inscripcion.id_inscripcion,
        valor_nuevo={"id_evento": id_evento, "estado": "PENDIENTE"},
        ip_direccion=request.client.host
    )
    
    return nueva_inscripcion

@router.get("/eventos/mis-inscripciones", response_model=List[evento_schema.InscripcionEventoResponse])
def obtener_mis_inscripciones(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == current_user.id_usuario
    ).all()

@router.delete("/eventos/{id_inscripcion}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_inscripcion(
    id_inscripcion: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    inscripcion = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_inscripcion == id_inscripcion,
        models.InscripcionEvento.id_usuario == current_user.id_usuario
    ).first()
    
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    db.delete(inscripcion)
    db.commit()
    
    # Registrar Log
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CANCELAR_INSCRIPCION_EVENTO",
        tabla_afectada="inscripciones_eventos",
        id_registro_afectado=id_inscripcion,
        ip_direccion=request.client.host
    )
    
    return None
