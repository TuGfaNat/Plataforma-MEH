from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import models
from ..schemas import recurso as recurso_schema
from ..core.permissions import PERMISSION_EVENTS_MANAGE, ensure_permission

def list_recursos(db: Session, categoria: Optional[str] = None) -> List[models.Recurso]:
    query = db.query(models.Recurso)
    if categoria:
        query = query.filter(models.Recurso.categoria == categoria)
    return query.order_by(models.Recurso.fecha_creacion.desc()).all()

def create_recurso(
    db: Session, 
    current_user: models.Usuario, 
    recurso: recurso_schema.RecursoCreate
) -> models.Recurso:
    # Solo administradores u organizadores pueden subir recursos
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para gestionar recursos")
    
    db_recurso = models.Recurso(
        **recurso.model_dump(),
        creado_por=current_user.id_usuario # MIXIN
    )
    db.add(db_recurso)
    db.commit()
    db.refresh(db_recurso)
    return db_recurso

def delete_recurso(db: Session, current_user: models.Usuario, id_recurso: int):
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para eliminar recursos")
    db_recurso = db.query(models.Recurso).filter(models.Recurso.id_recurso == id_recurso).first()
    if db_recurso:
        db.delete(db_recurso)
        db.commit()
    return {"message": "Recurso eliminado"}
