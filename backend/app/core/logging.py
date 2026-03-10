from sqlalchemy.orm import Session
from ..models import models
from datetime import datetime
import json

def registrar_log(
    db: Session,
    id_admin: int,
    accion: str,
    tabla_afectada: str = None,
    id_registro_afectado: int = None,
    valor_anterior: dict = None,
    valor_nuevo: dict = None,
    ip_direccion: str = None
):
    """
    Registra una acción en la tabla logs_sistema.
    """
    nuevo_log = models.LogSistema(
        id_admin=id_admin,
        accion=accion,
        tabla_afectada=tabla_afectada,
        id_registro_afectado=id_registro_afectado,
        valor_anterior=json.dumps(valor_anterior) if valor_anterior else None,
        valor_nuevo=json.dumps(valor_nuevo) if valor_nuevo else None,
        ip_direccion=ip_direccion,
        fecha_hora=datetime.utcnow()
    )
    db.add(nuevo_log)
    db.commit()
    return nuevo_log
