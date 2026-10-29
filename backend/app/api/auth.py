from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError, jwt

from ..database import get_db
from ..models import models
from ..schemas import user as user_schema
from ..core import auth as auth_core
from ..core.exceptions import CredencialesInvalidasError
from ..services import auth_service
from ..core.context import current_user_id


router = APIRouter(
    prefix="/auth",
    tags=["autenticacion"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.Usuario:
    """Dependencia para obtener el usuario autenticado a partir del JWT."""
    try:
        payload = jwt.decode(token, auth_core.SECRET_KEY, algorithms=[auth_core.ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise CredencialesInvalidasError("Token inválido: falta identificador de usuario")
    except JWTError:
        raise CredencialesInvalidasError("La sesión no es válida o ha expirado")
    
    user = db.query(models.Usuario).filter(models.Usuario.correo == correo).first()
    if user is None:
        raise CredencialesInvalidasError("El usuario de la sesión ya no existe")
    
    current_user_id.set(user.id_usuario)
    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[models.Usuario]:
    """Dependencia opcional para endpoints públicos que pueden beneficiarse de contexto autenticado."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, auth_core.SECRET_KEY, algorithms=[auth_core.ALGORITHM])
        correo: str = payload.get("sub")
        if not correo:
            return None
        user = db.query(models.Usuario).filter(models.Usuario.correo == correo).first()
        if user:
            current_user_id.set(user.id_usuario)
        return user
    except Exception:
        return None

@router.post("/register", response_model=user_schema.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """Endpoint para el registro público de nuevos miembros."""
    return auth_service.register_user(db, user)

@router.post("/login", response_model=user_schema.Token)
def login(request: Request, user_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):
    """Endpoint para inicio de sesión tradicional."""
    ip_address = request.client.host if request.client else None
    return auth_service.login_user(db, user_credentials, ip_address)

@router.post("/forgot-password")
def forgot_password(request: user_schema.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Endpoint para solicitar restablecimiento de contraseña."""
    return auth_service.forgot_password(db, request)

@router.post("/reset-password")
def reset_password(request: user_schema.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Endpoint para completar el restablecimiento de contraseña."""
    return auth_service.reset_password(db, request)

@router.post("/google", response_model=user_schema.Token)
def google_login(request: Request, payload: dict, db: Session = Depends(get_db)):
    """Endpoint para autenticación mediante Google OAuth."""
    ip_address = request.client.host if request.client else None
    return auth_service.login_with_google(db, payload.get("token"), ip_address)

@router.get("/me", response_model=user_schema.UserResponse)
def read_users_me(current_user: models.Usuario = Depends(get_current_user)):
    """Obtiene el perfil del usuario autenticado."""
    return current_user

@router.put("/me", response_model=user_schema.UserResponse)
def update_user_me(
    request: Request,
    user_update: user_schema.UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza los datos del perfil del usuario autenticado."""
    ip_address = request.client.host if request.client else None
    return auth_service.update_profile(db, current_user.id_usuario, user_update, ip_address)

@router.put("/me/password")
def cambiar_password(
    request: Request,
    datos: user_schema.CambiarPasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Cambia la contraseña del usuario autenticado (primer login o cambio voluntario)."""
    ip_address = request.client.host if request.client else None
    return auth_service.cambiar_password(db, current_user, datos, ip_address)

@router.post("/verificar-email")
def verificar_email(request: user_schema.VerificarEmailRequest, req: Request, db: Session = Depends(get_db)):
    """Verifica el correo electrónico de un usuario con el código recibido."""
    ip_address = req.client.host if req.client else None
    return auth_service.verificar_email(db, request, ip_address)

@router.post("/reenviar-codigo")
def reenviar_codigo(request: user_schema.ReenviarCodigoRequest, db: Session = Depends(get_db)):
    """Reenvía un nuevo código de verificación al correo."""
    return auth_service.reenviar_codigo_verificacion(db, request.correo)

@router.get("/usuarios", response_model=List[user_schema.UserResponse])
def get_usuarios(
    search: Optional[str] = None,
    rol: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Lista todos los usuarios (Solo para personal con permisos)."""
    return auth_service.list_users(db, current_user.rol, search, rol)

@router.put("/usuarios/{id_usuario}", response_model=user_schema.UserResponse)
def update_user_admin(
    id_usuario: int,
    payload: user_schema.AdminUserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza datos de un usuario desde administración (Solo ADMIN)."""
    ip_address = request.client.host if request.client else None
    return auth_service.admin_update_user(db, current_user, id_usuario, payload, ip_address)

@router.post("/usuarios/{id_usuario}/reset-password")
def reset_password_admin(
    id_usuario: int,
    payload: user_schema.AdminResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Restablece la contraseña de un usuario directamente (Solo ADMIN)."""
    ip_address = request.client.host if request.client else None
    return auth_service.admin_reset_password(db, current_user, id_usuario, payload.nueva_password, ip_address)

@router.post("/usuarios/{id_usuario}/suspender")
def suspender_usuario(
    id_usuario: int,
    payload: user_schema.SuspenderUsuarioRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Suspende a un usuario con motivo (Solo ADMIN)."""
    ip_address = request.client.host if request.client else None
    return auth_service.suspender_usuario(db, current_user, id_usuario, payload.motivo, ip_address)

@router.post("/usuarios/{id_usuario}/restaurar")
def restaurar_usuario(
    id_usuario: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Restaura una cuenta de usuario suspendida (Solo ADMIN)."""
    ip_address = request.client.host if request.client else None
    return auth_service.restaurar_usuario(db, current_user, id_usuario, ip_address)

@router.put("/usuarios/{id_usuario}/rol", response_model=user_schema.UserResponse)
def update_user_role(
    id_usuario: int,
    nuevo_rol: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Cambia el rango de un usuario (Solo para Administradores)."""
    ip_address = request.client.host if request.client else None
    return auth_service.update_user_role(db, current_user, id_usuario, nuevo_rol, ip_address)

@router.delete("/usuarios/{id_usuario}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(
    id_usuario: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Suspende lógicamente un usuario sin borrado físico (Solo Administradores)."""
    ip_address = request.client.host if request.client else None
    auth_service.delete_usuario(db, current_user, id_usuario, ip_address)

@router.get("/directorio", response_model=List[user_schema.DirectorioMiembroResponse])
def get_directorio(
    search: Optional[str] = None,
    q: Optional[str] = None,
    rol: Optional[str] = None,
    sort_by: Optional[str] = "nombres",
    sort_order: Optional[str] = "asc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Directorio de miembros con métricas y nivel (Solo ADMIN/ORGANIZADOR)."""
    return auth_service.get_directorio_miembros(
        db=db,
        current_user=current_user,
        search=search,
        q=q,
        rol=rol,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )


# --- ROUTER ALIAS DIRECTO /usuarios ---
router_usuarios = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

@router_usuarios.get("/directorio", response_model=List[user_schema.DirectorioMiembroResponse])
def get_directorio_usuarios(
    search: Optional[str] = None,
    q: Optional[str] = None,
    rol: Optional[str] = None,
    sort_by: Optional[str] = "nombres",
    sort_order: Optional[str] = "asc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Directorio de miembros con métricas y nivel (Solo ADMIN/ORGANIZADOR)."""
    return auth_service.get_directorio_miembros(
        db=db,
        current_user=current_user,
        search=search,
        q=q,
        rol=rol,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )

@router_usuarios.put("/{id_usuario}", response_model=user_schema.UserResponse)
def update_user_direct(
    id_usuario: int,
    payload: user_schema.AdminUserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return auth_service.admin_update_user(db, current_user, id_usuario, payload, ip_address)

@router_usuarios.post("/{id_usuario}/reset-password")
def reset_password_direct(
    id_usuario: int,
    payload: user_schema.AdminResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return auth_service.admin_reset_password(db, current_user, id_usuario, payload.nueva_password, ip_address)

@router_usuarios.post("/{id_usuario}/suspender")
def suspender_direct(
    id_usuario: int,
    payload: user_schema.SuspenderUsuarioRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return auth_service.suspender_usuario(db, current_user, id_usuario, payload.motivo, ip_address)

@router_usuarios.post("/{id_usuario}/restaurar")
def restaurar_direct(
    id_usuario: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return auth_service.restaurar_usuario(db, current_user, id_usuario, ip_address)

@router.post("/admin/users", status_code=status.HTTP_201_CREATED)
def admin_create_user_endpoint(
    request: Request,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Endpoint para que Administradores y Organizadores creen cuentas de usuario directamente."""
    from ..core.permissions import ensure_roles, ROLE_ADMIN, ROLE_ORGANIZADOR
    ensure_roles(current_user.rol, [ROLE_ADMIN, ROLE_ORGANIZADOR], "Solo Administradores y Organizadores pueden crear cuentas directamente.")
    ip_address = request.client.host if request.client else None
    return auth_service.admin_create_user(db, current_user, payload, ip_address)


@router.post("/admin/purge-seed-data", status_code=status.HTTP_200_OK)
def admin_purge_seed_data_endpoint(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Endpoint para que el SuperAdmin/Admin purgue físicamente todos los datos y cuentas semilla en producción."""
    from ..core.permissions import ensure_roles, ROLE_ADMIN
    ensure_roles(current_user.rol, [ROLE_ADMIN], "Solo Administradores pueden purgar los datos semilla.")
    from ..clean_seed_data import clean_database
    res = clean_database(db_session=db)
    return res


@router_usuarios.get("/{id_usuario}/expediente")
def get_usuario_expediente_usuarios_endpoint(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Consulta el expediente completo de un usuario (eventos, compras, asistencia, badges, etc.)."""
    return auth_service.get_usuario_expediente(db, current_user, id_usuario)

@router.get("/usuarios/{id_usuario}/expediente")
def get_usuario_expediente_auth_endpoint(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Consulta el expediente completo de un usuario (eventos, compras, asistencia, badges, etc.)."""
    return auth_service.get_usuario_expediente(db, current_user, id_usuario)
