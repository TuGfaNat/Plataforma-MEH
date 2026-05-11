import os
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from ..models import models
from ..schemas import user as user_schema
from ..core import auth as auth_core
from ..core.logging import registrar_log
from ..core.permissions import (
    ROLE_MIEMBRO,
    PERMISSION_USERS_READ,
    PERMISSION_AUDIT_READ,
    ensure_permission,
)


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def register_user(db: Session, user: user_schema.UserCreate) -> models.Usuario:
    existing_user = db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    new_user = models.Usuario(
        nombres=user.nombres,
        apellidos=user.apellidos,
        correo=user.correo,
        password_hash=auth_core.get_password_hash(user.password),
        rol=ROLE_MIEMBRO,
        fecha_registro=datetime.utcnow(),
        # Auditoría inicial
        creado_por=0, # 0 indica autoregistro
        fecha_creacion=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # NOTIFICACION EMAIL
    from . import email_service
    email_service.notify_bienvenida(new_user.correo, new_user.nombres)
    
    return new_user


def login_user(db: Session, credentials: user_schema.UserLogin, ip_address: Optional[str]) -> dict:
    user = db.query(models.Usuario).filter(models.Usuario.correo == credentials.correo).first()
    if not user or not auth_core.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})
    registrar_log(
        db=db,
        id_admin=user.id_usuario,
        accion="INICIO_SESION",
        tabla_afectada="usuarios",
        id_registro_afectado=user.id_usuario,
        ip_direccion=ip_address
    )
    return {"access_token": access_token, "token_type": "bearer"}


def login_with_google(db: Session, token: str, ip_address: Optional[str]) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo["email"]
        given_name = idinfo.get("given_name", idinfo.get("name", ""))
        family_name = idinfo.get("family_name", "")

        user = db.query(models.Usuario).filter(models.Usuario.correo == email).first()
        if not user:
            user = models.Usuario(
                nombres=given_name,
                apellidos=family_name,
                correo=email,
                password_hash="google_oauth_no_password",
                rol=ROLE_MIEMBRO,
                fecha_registro=datetime.utcnow(),
                creado_por=0 # Autoregistro
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            registrar_log(
                db=db,
                id_admin=user.id_usuario,
                accion="REGISTRO_GOOGLE",
                tabla_afectada="usuarios",
                id_registro_afectado=user.id_usuario,
                ip_direccion=ip_address
            )

        access_token = auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})
        registrar_log(
            db=db,
            id_admin=user.id_usuario,
            accion="LOGIN_GOOGLE",
            tabla_afectada="usuarios",
            id_registro_afectado=user.id_usuario,
            ip_direccion=ip_address
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Token de Google inválido")
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


def update_profile(
    db: Session,
    current_user: models.Usuario,
    user_update: user_schema.UserUpdate,
    ip_address: Optional[str]
) -> models.Usuario:
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    # AUDITORIA MIXIN
    current_user.modificado_por = current_user.id_usuario
    current_user.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ACTUALIZAR_PERFIL",
        tabla_afectada="usuarios",
        id_registro_afectado=current_user.id_usuario,
        valor_nuevo=update_data,
        ip_direccion=ip_address
    )
    return current_user


def list_users(db: Session, current_user: models.Usuario) -> List[models.Usuario]:
    ensure_permission(current_user.rol, PERMISSION_USERS_READ, "No tienes permisos para ver usuarios")
    return db.query(models.Usuario).order_by(models.Usuario.fecha_registro.desc()).all()

# --- FUNCION EXCLUSIVA ADMIN ---
def update_user_role(db: Session, current_user: models.Usuario, id_usuario: int, nuevo_rol: str, ip_address: Optional[str]):
    # Solo el admin supremo (que lee auditoria) puede cambiar roles
    ensure_permission(current_user.rol, PERMISSION_AUDIT_READ, "No tienes permisos para cambiar roles")
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    rol_anterior = usuario.rol
    usuario.rol = nuevo_rol
    
    # AUDITORIA MIXIN
    usuario.modificado_por = current_user.id_usuario
    usuario.fecha_modificacion = datetime.utcnow()
    
    db.commit()
    db.refresh(usuario)
    
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CAMBIO_ROL_USUARIO",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior={"rol": rol_anterior},
        valor_nuevo={"rol": nuevo_rol},
        ip_direccion=ip_address
    )
    return usuario
