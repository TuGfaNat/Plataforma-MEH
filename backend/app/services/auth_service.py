import os
import secrets
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
    ALL_DB_ROLES,
    PERMISSION_USERS_READ,
    PERMISSION_AUDIT_READ,
    has_permission
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def register_user(db: Session, user_data: user_schema.UserCreate) -> models.Usuario:
    """Registra un nuevo usuario en la plataforma con código de verificación por email."""
    existing_user = db.query(models.Usuario).filter(models.Usuario.correo == user_data.correo).first()
    if existing_user:
        raise RegistroDuplicadoError("El correo electrónico ya está registrado")

    codigo_verif = f"{secrets.randbelow(900000) + 100000}"

    new_user = models.Usuario(
        nombres=user_data.nombres,
        apellidos=user_data.apellidos,
        correo=user_data.correo,
        password_hash=auth_core.get_password_hash(user_data.password),
        rol=ROLE_MIEMBRO,
        fecha_registro=datetime.utcnow(),
        email_verificado=False,
        codigo_verificacion=codigo_verif,
        codigo_verificacion_exp=datetime.utcnow() + timedelta(minutes=30)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Enviar código de verificación por correo
    try:
        from . import email_service
        email_service.notify_email_verification(new_user.correo, new_user.nombres, codigo_verif)
    except Exception:
        pass
    
    return new_user

def login_user(db: Session, credentials: user_schema.UserLogin, ip_address: Optional[str] = None) -> dict:
    """Valida credenciales y genera un token JWT verificando activación y confirmación de correo."""
    user = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.correo == credentials.correo).first()
    
    if not user or not auth_core.verify_password(credentials.password, user.password_hash):
        raise CredencialesInvalidasError()

    if not user.activo or user.id_estado == 0:
        motivo = f": {user.motivo_suspension}" if user.motivo_suspension else ""
        raise ValidacionNegocioError(f"Tu cuenta de usuario ha sido suspendida{motivo}. Contacta al soporte.")

    if not user.email_verificado:
        raise ValidacionNegocioError("Tu correo electrónico no ha sido verificado. Por favor ingresa el código enviado a tu email antes de iniciar sesión.")

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
    """Inicia el flujo de recuperación de contraseña."""
    user = db.query(models.Usuario).filter(models.Usuario.correo == request.correo).first()
    
    if not user:
        # Por seguridad no revelamos si el usuario existe o no
        return True

    # Generar token aleatorio seguro
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_exp = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()

    # Enviar email
    try:
        from . import email_service
        email_service.notify_reset_password(user.correo, user.nombres, token)
    except Exception as e:
        print(f"Error enviando email de reset: {e}")
        return False
        
    return True

def reset_password(db: Session, request: user_schema.ResetPasswordRequest) -> bool:
    """Completa el flujo de recuperación de contraseña."""
    user = db.query(models.Usuario).filter(
        models.Usuario.reset_token == request.token,
        models.Usuario.reset_token_exp > datetime.utcnow()
    ).first()
    
    if not user:
        raise ValidacionNegocioError("El token es inválido o ha expirado")

    # Actualizar contraseña
    user.password_hash = auth_core.get_password_hash(request.nuevo_password)
    user.reset_token = None
    user.reset_token_exp = None
    user.es_nuevo = False # Si resetea contraseña, ya no es nuevo
    
    db.commit()
    
    return True

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
                fecha_registro=datetime.utcnow(),
                email_verificado=True
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
        else:
            if not user.email_verificado:
                user.email_verificado = True
                user.codigo_verificacion = None
                user.codigo_verificacion_exp = None
                db.commit()

        if not user.activo or user.id_estado == 0:
            motivo = f": {user.motivo_suspension}" if user.motivo_suspension else ""
            raise ValidacionNegocioError(f"Tu cuenta de usuario ha sido suspendida{motivo}. Contacta al soporte.")

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
    
    query = db.query(models.Usuario).execution_options(include_deleted=True)
    
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
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()
    
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
    """Suspende lógicamente un usuario sin borrado físico (Solo ADMIN)."""
    if admin_user.rol != "ADMIN":
        raise PermisoDenegadoError("Solo los administradores pueden eliminar o suspender usuarios")
    
    usuario = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()
        
    if usuario.id_usuario == admin_user.id_usuario:
        raise ValidacionNegocioError("No puedes eliminarte o suspenderte a ti mismo")

    if usuario.rol == "ADMIN":
        active_admins = db.query(models.Usuario).filter(
            models.Usuario.rol == "ADMIN",
            models.Usuario.activo == True,
            models.Usuario.id_estado != 0
        ).count()
        if active_admins <= 1:
            raise ValidacionNegocioError("No se puede eliminar o suspender al único administrador activo")
        
    usuario.id_estado = 0
    usuario.activo = False
    if not usuario.motivo_suspension:
        usuario.motivo_suspension = "Eliminado/Suspendido por administrador"
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="SUSPENSION_USUARIO",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior={"id_estado": 2, "activo": True},
        valor_nuevo={"id_estado": 0, "activo": False, "motivo": usuario.motivo_suspension},
        ip_direccion=ip_address
    )


def verificar_email(
    db: Session, 
    request: user_schema.VerificarEmailRequest, 
    ip_address: Optional[str] = None
) -> dict:
    """Verifica el correo electrónico de un usuario mediante su código numérico."""
    user = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.correo == request.correo).first()
    if not user:
        raise UsuarioNoEncontradoError("Usuario no encontrado")

    if user.email_verificado:
        return {"status": "success", "message": "El correo ya ha sido verificado anteriormente."}

    if not user.codigo_verificacion or user.codigo_verificacion.strip() != request.codigo.strip():
        raise ValidacionNegocioError("Código de verificación incorrecto")

    if user.codigo_verificacion_exp and user.codigo_verificacion_exp < datetime.utcnow():
        raise ValidacionNegocioError("El código de verificación ha expirado. Solicita un nuevo código.")

    user.email_verificado = True
    user.codigo_verificacion = None
    user.codigo_verificacion_exp = None
    db.commit()

    registrar_log(
        db=db,
        id_admin=user.id_usuario,
        accion="VERIFICACION_EMAIL",
        tabla_afectada="usuarios",
        id_registro_afectado=user.id_usuario,
        ip_direccion=ip_address
    )

    return {"status": "success", "message": "Correo electrónico verificado exitosamente."}


def reenviar_codigo_verificacion(db: Session, correo: str) -> dict:
    """Reenvía el código numérico de verificación de correo electrónico."""
    user = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.correo == correo).first()
    if not user:
        return {"status": "success", "message": "Si el correo está registrado, se ha enviado un nuevo código."}

    if user.email_verificado:
        return {"status": "success", "message": "Este correo ya está verificado."}

    codigo = f"{secrets.randbelow(900000) + 100000}"
    user.codigo_verificacion = codigo
    user.codigo_verificacion_exp = datetime.utcnow() + timedelta(minutes=30)
    db.commit()

    try:
        from . import email_service
        email_service.notify_email_verification(user.correo, user.nombres, codigo)
    except Exception:
        pass

    return {"status": "success", "message": "Código de verificación reenviado con éxito."}


def admin_update_user(
    db: Session,
    admin_user: models.Usuario,
    id_usuario: int,
    user_update: user_schema.AdminUserUpdate,
    ip_address: Optional[str] = None
) -> models.Usuario:
    """Edita los datos de un usuario desde el panel de administración (Solo ADMIN)."""
    if admin_user.rol != "ADMIN":
        raise PermisoDenegadoError("Solo los administradores pueden editar usuarios")

    usuario = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    update_dict = user_update.model_dump(exclude_unset=True)
    valor_anterior = {}
    for k in update_dict.keys():
        if hasattr(usuario, k):
            valor_anterior[k] = getattr(usuario, k)

    # Validar correo único si se cambia
    if "correo" in update_dict and update_dict["correo"] != usuario.correo:
        existente = db.query(models.Usuario).filter(models.Usuario.correo == update_dict["correo"]).first()
        if existente and existente.id_usuario != id_usuario:
            raise RegistroDuplicadoError("El correo electrónico ya está en uso por otro usuario")

    # Validar rol si se cambia
    if "rol" in update_dict and update_dict["rol"] != usuario.rol:
        nuevo_rol = update_dict["rol"]
        if nuevo_rol not in ALL_DB_ROLES:
            raise ValidacionNegocioError(f"Rol inválido: {nuevo_rol}")

        if usuario.id_usuario == admin_user.id_usuario and nuevo_rol != "ADMIN":
            raise ValidacionNegocioError("No puedes quitarte el rol de Administrador a ti mismo")

        if usuario.rol == "ADMIN" and nuevo_rol != "ADMIN":
            active_admins = db.query(models.Usuario).filter(
                models.Usuario.rol == "ADMIN",
                models.Usuario.activo == True,
                models.Usuario.id_estado != 0
            ).count()
            if active_admins <= 1:
                raise ValidacionNegocioError("No se puede degradar al único administrador activo")

    for k, v in update_dict.items():
        if hasattr(usuario, k):
            setattr(usuario, k, v)

    usuario.modificado_por = admin_user.id_usuario
    usuario.fecha_modificacion = datetime.utcnow()

    db.commit()
    db.refresh(usuario)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="EDICION_USUARIO_ADMIN",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior=valor_anterior,
        valor_nuevo=update_dict,
        ip_direccion=ip_address
    )
    return usuario


def admin_reset_password(
    db: Session,
    admin_user: models.Usuario,
    id_usuario: int,
    nueva_password: str,
    ip_address: Optional[str] = None
) -> dict:
    """Restablece directamente la contraseña de un usuario (Solo ADMIN)."""
    if admin_user.rol != "ADMIN":
        raise PermisoDenegadoError("Solo los administradores pueden restablecer contraseñas de usuarios")

    usuario = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    if len(nueva_password) < 8:
        raise ValidacionNegocioError("La contraseña debe tener al menos 8 caracteres")

    usuario.password_hash = auth_core.get_password_hash(nueva_password)
    usuario.reset_token = None
    usuario.reset_token_exp = None
    usuario.es_nuevo = True
    usuario.modificado_por = admin_user.id_usuario
    usuario.fecha_modificacion = datetime.utcnow()
    db.commit()

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="RESET_PASSWORD_ADMIN",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        ip_direccion=ip_address
    )
    return {"status": "success", "message": f"Contraseña restablecida exitosamente para {usuario.nombres}"}


def suspender_usuario(
    db: Session,
    admin_user: models.Usuario,
    id_usuario: int,
    motivo: str,
    ip_address: Optional[str] = None
) -> dict:
    """Suspende a un usuario con un motivo especificado sin borrado físico (Solo ADMIN)."""
    if admin_user.rol != "ADMIN":
        raise PermisoDenegadoError("Solo los administradores pueden suspender usuarios")

    usuario = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    if usuario.id_usuario == admin_user.id_usuario:
        raise ValidacionNegocioError("No puedes suspender tu propia cuenta")

    if usuario.rol == "ADMIN":
        active_admins = db.query(models.Usuario).filter(
            models.Usuario.rol == "ADMIN",
            models.Usuario.activo == True,
            models.Usuario.id_estado != 0
        ).count()
        if active_admins <= 1:
            raise ValidacionNegocioError("No se puede suspender al único administrador activo")

    motivo_limpio = motivo.strip() if motivo else "Suspendido por administrador"
    valor_anterior = {"activo": usuario.activo, "id_estado": usuario.id_estado, "motivo": usuario.motivo_suspension}

    usuario.activo = False
    usuario.id_estado = 0
    usuario.motivo_suspension = motivo_limpio
    usuario.modificado_por = admin_user.id_usuario
    usuario.fecha_modificacion = datetime.utcnow()
    db.commit()
    db.refresh(usuario)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="SUSPENSION_USUARIO",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior=valor_anterior,
        valor_nuevo={"activo": False, "id_estado": 0, "motivo": motivo_limpio},
        ip_direccion=ip_address
    )

    return {
        "status": "success", 
        "message": f"Usuario {usuario.nombres} suspendido exitosamente",
        "motivo": motivo_limpio,
        "motivo_suspension": motivo_limpio,
        "activo": False,
        "id_estado": 0
    }


def restaurar_usuario(
    db: Session,
    admin_user: models.Usuario,
    id_usuario: int,
    ip_address: Optional[str] = None
) -> dict:
    """Restaura una cuenta de usuario previamente suspendida (Solo ADMIN)."""
    if admin_user.rol != "ADMIN":
        raise PermisoDenegadoError("Solo los administradores pueden restaurar usuarios")

    usuario = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    valor_anterior = {"activo": usuario.activo, "id_estado": usuario.id_estado, "motivo": usuario.motivo_suspension}

    usuario.activo = True
    usuario.id_estado = 2
    usuario.motivo_suspension = None
    usuario.modificado_por = admin_user.id_usuario
    usuario.fecha_modificacion = datetime.utcnow()
    db.commit()
    db.refresh(usuario)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="RESTAURACION_USUARIO",
        tabla_afectada="usuarios",
        id_registro_afectado=id_usuario,
        valor_anterior=valor_anterior,
        valor_nuevo={"activo": True, "id_estado": 2, "motivo": None},
        ip_direccion=ip_address
    )

    return {
        "status": "success", 
        "message": f"Usuario {usuario.nombres} restaurado exitosamente",
        "activo": True,
        "id_estado": 2,
        "motivo_suspension": None
    }


