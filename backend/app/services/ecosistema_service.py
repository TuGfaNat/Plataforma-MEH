from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import models
from ..schemas import ecosistema as schema
from ..core.logging import registrar_log
from ..core.permissions import PERMISSION_EVENTS_MANAGE, has_permission
from ..core.exceptions import (
    RecursoNoEncontradoError,
    PermisoDenegadoError
)

# --- SERVICIOS DE SPEAKERS ---
def list_speakers(db: Session) -> List[models.Speaker]:
    return db.query(models.Speaker).all()

def create_speaker(db: Session, admin_user: models.Usuario, data: schema.SpeakerCreate, ip: str = None) -> models.Speaker:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    obj = models.Speaker(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    
    registrar_log(db, admin_user.id_usuario, "CREAR_SPEAKER", "speakers", obj.id_speaker, valor_nuevo=data.model_dump(), ip_direccion=ip)
    return obj

def update_speaker(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.SpeakerUpdate, ip: str = None) -> models.Speaker:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    obj = db.query(models.Speaker).filter(models.Speaker.id_speaker == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()

    old_data = {k: getattr(obj, k) for k in data.model_dump(exclude_unset=True).keys()}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_SPEAKER", "speakers", id_obj, valor_anterior=old_data, valor_nuevo=data.model_dump(exclude_unset=True), ip_direccion=ip)
    return obj

def delete_speaker(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Speaker).filter(models.Speaker.id_speaker == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_SPEAKER", "speakers", id_obj)

# --- SERVICIOS DE AUSPICIADORES ---
def list_auspiciadores(db: Session) -> List[models.Auspiciador]:
    return db.query(models.Auspiciador).all()

def create_auspiciador(db: Session, admin_user: models.Usuario, data: schema.AuspiciadorCreate, ip: str = None) -> models.Auspiciador:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = models.Auspiciador(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, admin_user.id_usuario, "CREAR_AUSPICIADOR", "auspiciadores", obj.id_auspiciador, valor_nuevo=data.model_dump(), ip_direccion=ip)
    return obj

def update_auspiciador(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.AuspiciadorUpdate, ip: str = None) -> models.Auspiciador:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    old_data = {k: getattr(obj, k) for k in data.model_dump(exclude_unset=True).keys()}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_AUSPICIADOR", "auspiciadores", id_obj, valor_anterior=old_data, valor_nuevo=data.model_dump(exclude_unset=True), ip_direccion=ip)
    return obj

def delete_auspiciador(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_AUSPICIADOR", "auspiciadores", id_obj)

# --- SERVICIOS DE COMUNIDADES ---
def list_comunidades(db: Session) -> List[models.ComunidadAliada]:
    return db.query(models.ComunidadAliada).all()

def create_comunidad(db: Session, admin_user: models.Usuario, data: schema.ComunidadCreate, ip: str = None) -> models.ComunidadAliada:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = models.ComunidadAliada(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, admin_user.id_usuario, "CREAR_COMUNIDAD", "comunidades_aliadas", obj.id_comunidad, valor_nuevo=data.model_dump(), ip_direccion=ip)
    return obj

def update_comunidad(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.ComunidadUpdate, ip: str = None) -> models.ComunidadAliada:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    old_data = {k: getattr(obj, k) for k in data.model_dump(exclude_unset=True).keys()}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_COMUNIDAD", "comunidades_aliadas", id_obj, valor_anterior=old_data, valor_nuevo=data.model_dump(exclude_unset=True), ip_direccion=ip)
    return obj

def delete_comunidad(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_COMUNIDAD", "comunidades_aliadas", id_obj)
