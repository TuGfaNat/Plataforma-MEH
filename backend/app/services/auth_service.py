import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from ..models import models
from ..schemas import user as user_schema
from ..core import auth as auth_core
from ..core.logging import registrar_log
from ..core.exceptions import (
    CredencialesInvalidasError,
    UsuarioNoEncontradoError,
    RegistroDuplicadoError,
    ValidacionNegocioError,
    PermisoDenegadoError,
    BaseDomainError
)
from ..core.permissions import (
    ROLE_MIEMBRO,
    ROLE_ADMIN,
    ALL_DB_ROLES,
    PERMISSION_USERS_READ,
    PERMISSION_AUDIT_READ,
    has_permission
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def register_user(db: Session, user_data: user_schema.UserCreate) -> models.Usuario:
    """Registra un nuevo usuario en la plataforma."""
    existing_user = db.query(models.Usuario).filter(models.Usuario.correo == user_data.correo).first()
    if existing_user:
        raise RegistroDuplicadoError("El correo electrónico ya está registrado")

    new_user = models.Usuario(
        nombres=user_data.nombres,
        apellidos=user_data.apellidos,
        correo=user_data.correo,
        password_hash=auth_core.get_password_hash(user_data.password),
        rol=ROLE_MIEMBRO,
        fecha_registro=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # NOTIFICACION EMAIL
    try:
        from . import email_service
        email_service.notify_bienvenida(new_user.correo, new_user.nombres)
    except Exception:
        pass
    
    return new_user

def login_user(db: Session, credentials: user_schema.UserLogin, ip_address: Optional[str] = None) -> dict:
    """Valida credenciales y genera un token JWT."""
    user = db.query(models.Usuario).filter(models.Usuario.correo == credentials.correo).first()
    
    if not user or not auth_core.verify_password(credentials.password, user.password_hash):
        raise CredencialesInvalidasError()

    if not user.activo:
        raise ValidacionNegocioError("La cuenta de usuario está desactivada")

    access_token = auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})
    
    registrar_log(
        db=db,
        id_admin=user.id_usuario,
        accion="INICIO_SESION",
        tabla_afectada="usuarios",
        id_registro_afectado=user.id_usuario,
        ip_direccion=ip_address
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "es_nuevo": bool(user.es_nuevo)
    }

def forgot_password(db: Session, request: user_schema.ForgotPasswordRequest) -> bool:
    """Inicia el flujo de recuperación de contraseña generando un token hasheado (sha256)."""
    user = db.query(models.Usuario).filter(models.Usuario.correo == request.correo).first()
    
    if not user:
        # Por seguridad no revelamos si el usuario existe o no
        return True

    # Generar token aleatorio seguro en texto plano para el correo
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    
    # Invalida automáticamente cualquier token previo y configura expiración configurable
    expire_minutes = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", 60))
    user.reset_token = token_hash
    user.reset_token_exp = datetime.utcnow() + timedelta(minutes=expire_minutes)
    
    db.commit()

    # Enviar email con el token sin hashear
    try:
        from . import email_service
        email_service.notify_reset_password(user.correo, user.nombres, raw_token)
    except Exception as e:
        print(f"Error enviando email de reset: {e}")
        return False
        
    return True

def reset_password(db: Session, request: user_schema.ResetPasswordRequest) -> bool:
    """Completa el flujo de recuperación de contraseña buscando por el hash sha256 del token."""
    token_hash = hashlib.sha256(request.token.encode("utf-8")).hexdigest()
    user = db.query(models.Usuario).filter(
        models.Usuario.reset_token == token_hash,
        models.Usuario.reset_token_exp > datetime.utcnow()
    ).first()
    
    if not user:
        raise ValidacionNegocioError("El token es inválido o ha expirado")

    # Actualizar contraseña e invalidar token
    user.password_hash = auth_core.get_password_hash(request.nuevo_password)
    user.reset_token = None
    user.reset_token_exp = None
    user.es_nuevo = False # Si resetea contraseña, ya no es nuevo
    
    db.commit()
    
    return True

def cambiar_password(
    db: Session,
    current_user: models.Usuario,
    request: user_schema.CambiarPasswordRequest,
    ip_address: Optional[str] = None
) -> dict:
    """Cambia la contraseña de un usuario autenticado (primer login es_nuevo o voluntario)."""
    if not auth_core.verify_password(request.password_actual, current_user.password_hash):
        raise CredencialesInvalidasError("La contraseña actual es incorrecta")

    current_user.password_hash = auth_core.get_password_hash(request.nuevo_password)
    current_user.es_nuevo = False
    db.commit()

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="CAMBIO_PASSWORD",
        tabla_afectada="usuarios",
        id_registro_afectado=current_user.id_usuario,
        ip_direccion=ip_address
    )

    return {"mensaje": "Contraseña actualizada exitosamente"}

def login_with_google(db: Session, google_jwt: str, ip_address: Optional[str] = None) -> dict:
    """Valida un token de Google y genera un token JWT de la plataforma."""
    try:
        idinfo = id_token.verify_oauth2_token(google_jwt, google_requests.Request(), GOOGLE_CLIENT_ID)
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
                fecha_registro=datetime.utcnow()
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

        if not user.activo:
            raise ValidacionNegocioError("La cuenta de usuario está desactivada")

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
        raise ValidacionNegocioError("Token de Google inválido o expirado")
    except Exception as e:
        if isinstance(e, BaseDomainError): raise
        raise ValidacionNegocioError(f"Error en autenticación de Google: {str(e)}")

def update_profile(
    db: Session,
    user_id: int,
    user_update: user_schema.UserUpdate,
    ip_address: Optional[str] = None
) -> models.Usuario:
    """Actualiza el perfil del usuario actual registrando cambios en la auditoría."""
    user = db.query(models.Usuario).filter(models.Usuario.id_usuario == user_id).first()
    if not user:
        raise UsuarioNoEncontradoError()

    # 1. Capturar valores anteriores para auditoría
    update_data = user_update.model_dump(exclude_unset=True)
    valor_anterior = {}
    for key in update_data.keys():
        if hasattr(user, key):
            valor_anterior[key] = getattr(user, key)

    # 2. Aplicar cambios
    # Prevenir cambios no autorizados
    update_data.pop("rol", None)
    update_data.pop("activo", None)

    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)

    # 3. Registrar log con comparación real
    registrar_log(
        db=db,
        id_admin=user.id_usuario,
        accion="ACTUALIZAR_PERFIL",
        tabla_afectada="usuarios",
        id_registro_afectado=user.id_usuario,
        valor_anterior=valor_anterior,
        valor_nuevo=update_data,
        ip_direccion=ip_address
    )
    return user

def list_users(
    db: Session, 
    admin_role: str,
    search: Optional[str] = None,
    rol_filter: Optional[str] = None
) -> List[models.Usuario]:
    """Lista usuarios del sistema (Solo Staff con permiso)."""
    if not has_permission(admin_role, PERMISSION_USERS_READ):
        raise PermisoDenegadoError("No tienes permisos para listar usuarios")
    
    query = db.query(models.Usuario)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Usuario.nombres.ilike(search_filter),
                models.Usuario.apellidos.ilike(search_filter),
                models.Usuario.correo.ilike(search_filter),
                models.Usuario.alias.ilike(search_filter)
            )
        )
    
    if rol_filter:
        query = query.filter(models.Usuario.rol == rol_filter)
        
    users = query.order_by(models.Usuario.fecha_registro.desc()).all()
    
    # Inyectar métricas de fidelidad
    for u in users:
        u.badge_count = len(u.badges)
        u.souvenir_count = len(u.pedidos)
        u.total_invertido = sum([p.total for p in u.pedidos if p.estado == "COMPLETADO"])
        
    return users

def update_user_role(
    db: Session, 
    admin_user: models.Usuario, 
    id_usuario: int, 
    nuevo_rol: str, 
    ip_address: Optional[str] = None
) -> models.Usuario:
    """Cambia el rol de un usuario (Solo ADMIN)."""
    if not has_permission(admin_user.rol, PERMISSION_AUDIT_READ):
        raise PermisoDenegadoError("Solo los administradores pueden cambiar roles")
    
    if nuevo_rol not in ALL_DB_ROLES:
        raise ValidacionNegocioError(f"Rol inválido: '{nuevo_rol}'. Los roles permitidos son: {', '.join(ALL_DB_ROLES)}")

    if admin_user.id_usuario == id_usuario:
        raise ValidacionNegocioError("No puedes cambiarte el rol a ti mismo")

    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    if usuario.rol == ROLE_ADMIN and nuevo_rol != ROLE_ADMIN:
        active_admins = db.query(models.Usuario).filter(
            models.Usuario.rol == ROLE_ADMIN,
            models.Usuario.activo == True,
            models.Usuario.id_estado != 0
        ).count()
        if active_admins <= 1:
            raise ValidacionNegocioError("No se puede degradar al único administrador activo del sistema")
    
    rol_anterior = usuario.rol
    usuario.rol = nuevo_rol
    
    db.commit()
    db.refresh(usuario)
    
    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="CAMBIO_ROL_USUARIO",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior={"rol": rol_anterior},
        valor_nuevo={"rol": nuevo_rol},
        ip_direccion=ip_address
    )
    return usuario


def delete_usuario(
    db: Session, 
    admin_user: models.Usuario, 
    id_usuario: int, 
    ip_address: Optional[str] = None
) -> None:
    """Elimina lógicamente un usuario (id_estado = 0, activo = False) (Solo ADMIN)."""
    if admin_user.rol != "ADMIN":
        raise PermisoDenegadoError("Solo los administradores pueden eliminar usuarios")
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()
        
    if usuario.id_usuario == admin_user.id_usuario:
        raise ValidacionNegocioError("No puedes eliminarte a ti mismo")
        
    usuario.id_estado = 0
    usuario.activo = False
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="ELIMINAR_USUARIO",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior={"id_estado": 2, "activo": True},
        valor_nuevo={"id_estado": 0, "activo": False},
        ip_direccion=ip_address
    )

