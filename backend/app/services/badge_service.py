from sqlalchemy.orm import Session
from ..models import models
from ..schemas import badge as badge_schema
from typing import List, Optional
from datetime import datetime
from ..core.logging import registrar_log

def get_all_badges(db: Session) -> List[models.Badge]:
    return db.query(models.Badge).all()

def create_badge(db: Session, badge: badge_schema.BadgeCreate, id_admin: int) -> models.Badge:
    db_badge = models.Badge(
        **badge.model_dump(),
        creado_por=id_admin
    )
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    
    registrar_log(
        db=db,
        id_admin=id_admin,
        accion="CREAR_BADGE",
        tabla_afectada="badges",
        id_registro_afectado=db_badge.id_badge,
        valor_nuevo=badge.model_dump()
    )
    
    return db_badge

def update_badge(db: Session, id_badge: int, badge_update: badge_schema.BadgeUpdate, id_admin: int) -> Optional[models.Badge]:
    db_badge = db.query(models.Badge).filter(models.Badge.id_badge == id_badge).first()
    if not db_badge:
        return None
    
    old_data = {
        "nombre_badge": db_badge.nombre_badge,
        "descripcion": db_badge.descripcion,
        "imagen_url": db_badge.imagen_url,
        "puntos": db_badge.puntos,
        "requisito_nivel": db_badge.requisito_nivel
    }

    for key, value in badge_update.model_dump(exclude_unset=True).items():
        setattr(db_badge, key, value)
    
    db_badge.modificado_por = id_admin
    db_badge.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    db.refresh(db_badge)

    registrar_log(
        db=db,
        id_admin=id_admin,
        accion="ACTUALIZAR_BADGE",
        tabla_afectada="badges",
        id_registro_afectado=id_badge,
        valor_anterior=old_data,
        valor_nuevo=badge_update.model_dump(exclude_unset=True)
    )
    
    return db_badge

def delete_badge(db: Session, id_badge: int, id_admin: int) -> bool:
    db_badge = db.query(models.Badge).filter(models.Badge.id_badge == id_badge).first()
    if not db_badge:
        return False
    
    db.delete(db_badge)
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=id_admin,
        accion="ELIMINAR_BADGE",
        tabla_afectada="badges",
        id_registro_afectado=id_badge
    )
    
    return True

def get_user_badges(db: Session, id_usuario: int) -> List[models.Badge]:
    return db.query(models.Badge).join(models.UsuarioBadge).filter(models.UsuarioBadge.id_usuario == id_usuario).all()

def assign_badge_to_user(db: Session, id_usuario: int, id_badge: int, id_admin: int) -> models.UsuarioBadge:
    # Evitar duplicados
    exists = db.query(models.UsuarioBadge).filter(
        models.UsuarioBadge.id_usuario == id_usuario,
        models.UsuarioBadge.id_badge == id_badge
    ).first()
    
    if exists:
        return exists

    db_user_badge = models.UsuarioBadge(
        id_usuario=id_usuario, 
        id_badge=id_badge,
        creado_por=id_admin
    )
    db.add(db_user_badge)
    db.commit()
    db.refresh(db_user_badge)
    
    registrar_log(
        db=db,
        id_admin=id_admin,
        accion="ASIGNAR_BADGE",
        tabla_afectada="usuarios_badges",
        id_registro_afectado=db_user_badge.id_usuario_badge,
        valor_nuevo={"id_usuario": id_usuario, "id_badge": id_badge}
    )
    
    return db_user_badge
