from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models import models
from ..schemas import recurso as recurso_schema
from ..core.permissions import PERMISSION_EVENTS_MANAGE, ensure_permission
from ..core.logging import registrar_log
from ..core.exceptions import RecursoNoEncontradoError

def list_recursos(db: Session, categoria: Optional[str] = None) -> List[models.Recurso]:
    query = db.query(models.Recurso)
    if categoria:
        query = query.filter(models.Recurso.categoria == categoria)
    return query.order_by(models.Recurso.fecha_creacion.desc()).all()

def create_recurso(
    db: Session, 
    current_user: models.Usuario, 
    recurso: recurso_schema.RecursoCreate,
    ip_address: Optional[str] = None
) -> models.Recurso:
    """Crea un recurso en la biblioteca con auditoría."""
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para gestionar recursos")
    
    db_recurso = models.Recurso(
        **recurso.model_dump(),
        creado_por=current_user.id_usuario,
        fecha_creacion=datetime.utcnow()
    )
    db.add(db_recurso)
    db.commit()
    db.refresh(db_recurso)
    
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CREAR_RECURSO_BIBLIOTECA",
        tabla_afectada="recursos",
        id_registro_afectado=db_recurso.id_recurso,
        valor_nuevo=recurso.model_dump(),
        ip_direccion=ip_address
    )
    return db_recurso

def update_recurso(
    db: Session,
    current_user: models.Usuario,
    id_recurso: int,
    recurso_update: recurso_schema.RecursoUpdate,
    ip_address: Optional[str] = None
) -> models.Recurso:
    """Actualiza un recurso existente con captura de cambios para auditoría."""
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para editar recursos")
    
    db_recurso = db.query(models.Recurso).filter(models.Recurso.id_recurso == id_recurso).first()
    if not db_recurso:
        raise RecursoNoEncontradoError()

    update_data = recurso_update.model_dump(exclude_unset=True)
    valor_anterior = {k: getattr(db_recurso, k) for k in update_data.keys() if hasattr(db_recurso, k)}

    for key, value in update_data.items():
        setattr(db_recurso, key, value)
    
    db_recurso.modificado_por = current_user.id_usuario
    db_recurso.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    db.refresh(db_recurso)
    
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ACTUALIZAR_RECURSO_BIBLIOTECA",
        tabla_afectada="recursos",
        id_registro_afectado=id_recurso,
        valor_anterior=valor_anterior,
        valor_nuevo=update_data,
        ip_direccion=ip_address
    )
    return db_recurso

def delete_recurso(db: Session, current_user: models.Usuario, id_recurso: int, ip_address: Optional[str] = None):
    """Elimina un recurso de la biblioteca con registro en auditoría."""
    ensure_permission(current_user.rol, PERMISSION_EVENTS_MANAGE, "No tienes permisos para eliminar recursos")
    
    db_recurso = db.query(models.Recurso).filter(models.Recurso.id_recurso == id_recurso).first()
    if not db_recurso:
        raise RecursoNoEncontradoError()
    
    titulo_eliminado = db_recurso.titulo
    db.delete(db_recurso)
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="BORRAR_RECURSO_BIBLIOTECA",
        tabla_afectada="recursos",
        id_registro_afectado=id_recurso,
        valor_anterior={"titulo": titulo_eliminado},
        ip_direccion=ip_address
    )
    return {"message": "Recurso eliminado correctamente"}
