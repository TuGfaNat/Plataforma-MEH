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
        alias=getattr(user_data, "alias", None),
        institucion=getattr(user_data, "institucion", None),
        estudia_en=getattr(user_data, "estudia_en", None) or getattr(user_data, "institucion", None),
        tipo_entidad=getattr(user_data, "tipo_entidad", "Estudiante"),
        pais=getattr(user_data, "pais", "Bolivia"),
        departamento=getattr(user_data, "departamento", None),
        bio=getattr(user_data, "bio", None),
        linkedin_url=str(getattr(user_data, "linkedin_url", "") or "") or None,
        github_url=str(getattr(user_data, "github_url", "") or "") or None,
        fecha_registro=datetime.utcnow(),
        es_nuevo=False,
        email_verificado=False,
        codigo_verificacion=codigo_verif,
        codigo_verificacion_exp=datetime.utcnow() + timedelta(minutes=30)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Enviar código de verificación por correo; si el servidor SMTP falla o no está activo,
    # auto-verificar la cuenta como salvavidas para no bloquear inscripciones a eventos.
    sent = False
    try:
        from . import email_service
        sent = bool(email_service.notify_email_verification(new_user.correo, new_user.nombres, codigo_verif))
    except Exception:
        sent = False

    if not sent:
        new_user.email_verificado = True
        new_user.codigo_verificacion = None
        new_user.codigo_verificacion_exp = None
        db.commit()
        db.refresh(new_user)
    
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
        # Verificar si hubo un fallo de envío SMTP registrado para este usuario (usuarios registrados cuando SMTP falló)
        fallo_previo = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "FALLO_ENVIO_EMAIL"
        ).order_by(models.LogSistema.id_log.desc()).limit(25).all()
        tuvo_fallo_correo = any(
            isinstance(log.valor_nuevo, dict) and log.valor_nuevo.get("destinatario") == user.correo
            for log in fallo_previo
        )
        if tuvo_fallo_correo:
            user.email_verificado = True
            user.codigo_verificacion = None
            user.codigo_verificacion_exp = None
            db.commit()
            db.refresh(user)
        else:
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
    
    # Si es un miembro auto-registrado (sin creado_por y sin reset administrativo previo),
    # no debe forzarse el cambio de contraseña en su primer ingreso.
    if user.es_nuevo and user.rol == ROLE_MIEMBRO and user.creado_por is None and user.modificado_por is None:
        user.es_nuevo = False
        db.commit()

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
                fecha_registro=datetime.utcnow(),
                es_nuevo=False,
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
    
    # Excluir cuentas semilla y de prueba
    query = query.filter(
        ~models.Usuario.correo.ilike("user%@test.com"),
        ~models.Usuario.alias.ilike("dev_%"),
        ~models.Usuario.correo.ilike("%@test.com"),
        ~models.Usuario.correo.ilike("%@example.com"),
        ~models.Usuario.correo.ilike("%@realdomain.org"),
        ~models.Usuario.correo.ilike("%_e2e_%"),
        ~models.Usuario.correo.ilike("test_%@meh.com"),
        ~models.Usuario.correo.ilike("admin_test_%"),
        ~models.Usuario.correo.ilike("admin_http_%"),
        ~models.Usuario.correo.ilike("staff_http_%"),
        ~models.Usuario.correo.ilike("alumno_http_%"),
        ~models.Usuario.correo.ilike("admin_undo_%"),
        ~models.Usuario.correo.ilike("staff_undo_%"),
        ~models.Usuario.correo.ilike("admin_hist_%"),
        ~models.Usuario.correo.ilike("staff_hist_%"),
        ~models.Usuario.correo.ilike("admin_acred_%"),
        ~models.Usuario.correo.ilike("org_acred_%"),
        ~models.Usuario.correo.ilike("miembro_%@meh.com"),
        ~models.Usuario.correo.ilike("carlos_%@meh.com"),
        ~models.Usuario.correo.ilike("alice_%@meh.com"),
        ~models.Usuario.correo.ilike("bob_%@meh.com"),
        ~models.Usuario.correo.ilike("org_%@meh.com"),
        ~models.Usuario.correo.ilike("op_%@meh.com"),
        ~models.Usuario.correo.ilike("staff_scan_%"),
        ~models.Usuario.correo.ilike("admin_em_%"),
        ~models.Usuario.correo.ilike("admin_cad_%"),
        ~models.Usuario.correo.ilike("org_em_%"),
        ~models.Usuario.correo.ilike("emb_cad_%"),
        ~models.Usuario.correo.ilike("miembro_em_%"),
        ~models.Usuario.correo.ilike("miembro_cad_%"),
        ~models.Usuario.correo.ilike("user_life_%"),
        ~models.Usuario.correo.ilike("admin_017_%"),
        ~models.Usuario.correo.ilike("admin_019_%"),
        ~models.Usuario.correo.ilike("ana_019_%"),
        ~models.Usuario.correo.ilike("beatriz_017_%"),
        ~models.Usuario.correo.ilike("diego_017_%"),
        ~models.Usuario.correo.ilike("lucas_offline_%"),
        ~models.Usuario.correo.ilike("maria_gomez_%"),
        ~models.Usuario.correo.ilike("admin_life_%"),
        ~models.Usuario.correo.ilike("ana_v_%"),
        ~models.Usuario.correo.ilike("maria_stud_%"),
        ~models.Usuario.correo.ilike("juan_choque_%"),
        ~models.Usuario.correo.ilike("alumno_%"),
        ~models.Usuario.correo.ilike("otro_staff_%"),
        ~models.Usuario.correo.ilike("inscrito_%"),
        ~models.Usuario.correo.ilike("noinsc_%"),
        ~models.Usuario.correo.ilike("lucia_real_%"),
        models.Usuario.correo != "audit_test@meh.com",
        models.Usuario.correo != "carlos@gmail.com",
        models.Usuario.correo != "ana@outlook.com"
    )
    
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
        
    users = query.order_by(models.Usuario.id_usuario.desc(), models.Usuario.fecha_registro.desc()).all()
    
    # Inyectar métricas de fidelidad de manera resiliente
    for u in users:
        try:
            u.badge_count = len(u.badges) if hasattr(u, "badges") and u.badges is not None else 0
        except Exception:
            u.badge_count = 0
        try:
            u.souvenir_count = len(u.pedidos) if hasattr(u, "pedidos") and u.pedidos is not None else 0
            u.total_invertido = sum([p.total for p in u.pedidos if p and p.estado == "COMPLETADO"]) if hasattr(u, "pedidos") and u.pedidos else 0
        except Exception:
            u.souvenir_count = 0
            u.total_invertido = 0
        
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

    sent = False
    try:
        from . import email_service
        sent = bool(email_service.notify_email_verification(user.correo, user.nombres, codigo))
    except Exception:
        sent = False

    if not sent:
        user.email_verificado = True
        user.codigo_verificacion = None
        user.codigo_verificacion_exp = None
        db.commit()
        return {
            "status": "auto_verified",
            "email_verificado": True,
            "message": "El servidor de correo no pudo entregar el mensaje; tu cuenta ha sido verificada automáticamente."
        }

    return {"status": "success", "email_verificado": False, "message": "Código de verificación reenviado con éxito."}


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


NIVEL_HIERARCHY = {
    "novato": 1,
    "principiante": 1,
    "beginner": 1,
    "explorer": 2,
    "explorador": 2,
    "intermedio": 2,
    "legend": 3,
    "leyenda": 3,
    "avanzado": 3,
    "master": 4,
    "maestro": 4,
    "experto": 4,
    "champion": 5,
    "campeon": 5,
    "campeón": 5,
}

def _derive_user_level(badges: list) -> str:
    """Deriva el nivel más alto de un miembro según los requisitos de sus badges."""
    if not badges:
        return "Beginner"
    best_level = "Beginner"
    best_rank = 0
    for b in badges:
        req = getattr(b, "requisito_nivel", None)
        if req:
            req_str = str(req).strip()
            rank = NIVEL_HIERARCHY.get(req_str.lower(), 1)
            if rank > best_rank:
                best_rank = rank
                best_level = req_str
    return best_level

def get_directorio_miembros(
    db: Session,
    current_user: models.Usuario,
    search: Optional[str] = None,
    q: Optional[str] = None,
    rol: Optional[str] = None,
    sort_by: Optional[str] = "nombres",
    sort_order: Optional[str] = "asc",
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    """Retorna el directorio de miembros con nivel derivado, asistencias, compras, cursos y badges (Solo ADMIN/ORGANIZADOR)."""
    from ..core.permissions import ADMIN_OR_ORGANIZER_ROLES, ensure_roles
    from sqlalchemy import func
    ensure_roles(current_user.rol, ADMIN_OR_ORGANIZER_ROLES, "No tienes privilegios para consultar el directorio de miembros")

    query = db.query(models.Usuario)
    
    search_term = q or search
    if search_term:
        term = f"%{search_term.strip()}%"
        query = query.filter(
            or_(
                models.Usuario.nombres.ilike(term),
                models.Usuario.apellidos.ilike(term),
                models.Usuario.correo.ilike(term),
                models.Usuario.alias.ilike(term)
            )
        )
    
    if rol and rol.upper() != "TODOS":
        query = query.filter(models.Usuario.rol == rol.upper())

    usuarios = query.all()
    user_ids = [u.id_usuario for u in usuarios]
    if not user_ids:
        return []

    # 1. Asistencias confirmadas (InscripcionEvento.asistio == True)
    asistencias_map = {}
    asistencias_rows = db.query(
        models.InscripcionEvento.id_usuario,
        func.count(models.InscripcionEvento.id_inscripcion)
    ).filter(
        models.InscripcionEvento.id_usuario.in_(user_ids),
        models.InscripcionEvento.asistio == True
    ).group_by(models.InscripcionEvento.id_usuario).all()
    for uid, count in asistencias_rows:
        asistencias_map[uid] = count

    # 2. Compras registradas (Pedido)
    compras_map = {}
    compras_rows = db.query(
        models.Pedido.id_usuario,
        func.count(models.Pedido.id_pedido)
    ).filter(
        models.Pedido.id_usuario.in_(user_ids)
    ).group_by(models.Pedido.id_usuario).all()
    for uid, count in compras_rows:
        compras_map[uid] = count

    # 3. Cursos inscritos (InscripcionCurso)
    cursos_map = {}
    cursos_rows = db.query(
        models.InscripcionCurso.id_usuario,
        func.count(models.InscripcionCurso.id_inscripcion_curso)
    ).filter(
        models.InscripcionCurso.id_usuario.in_(user_ids)
    ).group_by(models.InscripcionCurso.id_usuario).all()
    for uid, count in cursos_rows:
        cursos_map[uid] = count

    # 4. Badges obtenidos
    badges_map = {}
    ub_rows = db.query(
        models.UsuarioBadge.id_usuario,
        models.Badge
    ).join(
        models.Badge, models.Badge.id_badge == models.UsuarioBadge.id_badge
    ).filter(
        models.UsuarioBadge.id_usuario.in_(user_ids)
    ).all()
    for uid, badge in ub_rows:
        if uid not in badges_map:
            badges_map[uid] = []
        badges_map[uid].append(badge)

    items = []
    for u in usuarios:
        user_badges = badges_map.get(u.id_usuario, [])
        derived_level = _derive_user_level(user_badges)
        badge_items = [
            {
                "id_badge": b.id_badge,
                "nombre_badge": b.nombre_badge,
                "descripcion": b.descripcion,
                "imagen_url": b.imagen_url,
                "puntos": b.puntos or 10,
                "requisito_nivel": b.requisito_nivel or "Beginner"
            }
            for b in user_badges
        ]
        items.append({
            "id_usuario": u.id_usuario,
            "nombres": u.nombres,
            "apellidos": u.apellidos,
            "correo": u.correo,
            "rol": u.rol,
            "foto_url": u.foto_url,
            "alias": u.alias,
            "nivel": derived_level,
            "asistencias": asistencias_map.get(u.id_usuario, 0),
            "compras": compras_map.get(u.id_usuario, 0),
            "cursos": cursos_map.get(u.id_usuario, 0),
            "badges": badge_items,
            "fecha_registro": u.fecha_registro
        })

    reverse = (sort_order or "asc").lower() == "desc"
    sort_key = (sort_by or "nombres").lower()

    if sort_key in ["nombres", "nombre"]:
        items.sort(key=lambda x: f"{x['nombres']} {x['apellidos']}".lower(), reverse=reverse)
    elif sort_key == "asistencias":
        items.sort(key=lambda x: x["asistencias"], reverse=reverse)
    elif sort_key == "compras":
        items.sort(key=lambda x: x["compras"], reverse=reverse)
    elif sort_key == "cursos":
        items.sort(key=lambda x: x["cursos"], reverse=reverse)
    elif sort_key == "nivel":
        items.sort(key=lambda x: NIVEL_HIERARCHY.get(x["nivel"].lower(), 1), reverse=reverse)
    elif sort_key == "correo":
        items.sort(key=lambda x: x["correo"].lower(), reverse=reverse)
    elif sort_key == "rol":
        items.sort(key=lambda x: x["rol"].lower(), reverse=reverse)
    elif sort_key == "fecha_registro":
        items.sort(key=lambda x: x["fecha_registro"] or datetime.min, reverse=reverse)
    else:
        items.sort(key=lambda x: f"{x['nombres']} {x['apellidos']}".lower(), reverse=reverse)

    return items[skip:skip + limit]

def admin_create_user(
    db: Session,
    admin_user: models.Usuario,
    user_data: dict,
    ip_address: Optional[str] = None
) -> dict:
    """Crea una cuenta de usuario directamente por parte de un Administrador con email verificado."""
    correo = user_data.get("correo", "").strip().lower()
    if not correo:
        raise ValidacionNegocioError("El correo electronico es requerido.")

    existing = db.query(models.Usuario).filter(models.Usuario.correo == correo).first()
    if existing:
        raise RegistroDuplicadoError("El correo electronico ya esta registrado.")

    raw_password = user_data.get("password")
    if not raw_password or len(raw_password.strip()) < 6:
        raw_password = secrets.token_urlsafe(8)

    rol = user_data.get("rol", ROLE_MIEMBRO)
    if admin_user.rol != ROLE_ADMIN:
        rol = ROLE_MIEMBRO
    elif rol not in ALL_DB_ROLES:
        rol = ROLE_MIEMBRO

    new_user = models.Usuario(
        nombres=user_data.get("nombres", "").strip(),
        apellidos=user_data.get("apellidos", "").strip(),
        correo=correo,
        password_hash=auth_core.get_password_hash(raw_password),
        rol=rol,
        institucion=user_data.get("institucion"),
        estudia_en=user_data.get("institucion"),
        tipo_entidad=user_data.get("tipo_entidad", "Estudiante"),
        pais=user_data.get("pais", "Bolivia"),
        departamento=user_data.get("departamento"),
        fecha_registro=datetime.utcnow(),
        es_nuevo=False,
        email_verificado=True,
        codigo_verificacion=None,
        codigo_verificacion_exp=None,
        creado_por=admin_user.id_usuario,
        id_estado=2,
        activo=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="CREAR_USUARIO_ADMIN",
        tabla_afectada="usuarios",
        id_registro_afectado=new_user.id_usuario,
        valor_nuevo={"correo": correo, "rol": rol, "nombres": new_user.nombres},
        ip_direccion=ip_address
    )

    return {
        "id_usuario": new_user.id_usuario,
        "nombres": new_user.nombres,
        "apellidos": new_user.apellidos,
        "correo": new_user.correo,
        "rol": new_user.rol,
        "email_verificado": True,
        "temporary_password": raw_password
    }
