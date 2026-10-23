from sqlalchemy.orm import Session
from ..models import models
from datetime import datetime, date
from decimal import Decimal
import uuid
import json

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, uuid.UUID):
        return str(obj)
    raise TypeError("Type %s not serializable" % type(obj))

def registrar_log(
    db: Session,
    id_admin: int,
    accion: str,
    tabla_afectada: str = None,
    id_registro_afectado: int = None,
    valor_anterior: dict = None,
    valor_nuevo: dict = None,
    ip_direccion: str = None,
    commit: bool = True
):
    """
    Registra una acción en la tabla logs_sistema con serialización JSON segura.
    Si commit=False, hace flush dentro de la transacción activa sin comitear.
    """
    v_ant = json.dumps(valor_anterior, default=json_serial) if valor_anterior else None
    v_nue = json.dumps(valor_nuevo, default=json_serial) if valor_nuevo else None

    nuevo_log = models.LogSistema(
        id_admin=id_admin,
        accion=accion,
        tabla_afectada=tabla_afectada,
        id_registro_afectado=id_registro_afectado,
        valor_anterior=v_ant,
        valor_nuevo=v_nue,
        ip_direccion=ip_direccion,
        fecha_hora=datetime.utcnow()
    )
    db.add(nuevo_log)
    if commit:
        db.commit()
    else:
        db.flush()
    return nuevo_log
