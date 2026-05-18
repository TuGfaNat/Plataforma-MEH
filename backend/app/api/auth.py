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

router = APIRouter(
    prefix="/auth",
    tags=["autenticacion"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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
    
    return user

@router.post("/register", response_model=user_schema.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """Endpoint para el registro público de nuevos miembros."""
    return auth_service.register_user(db, user)

@router.post("/login", response_model=user_schema.Token)
def login(request: Request, user_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):
    """Endpoint para inicio de sesión tradicional."""
    ip_address = request.client.host if request.client else None
    return auth_service.login_user(db, user_credentials, ip_address)

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

@router.get("/usuarios", response_model=List[user_schema.UserResponse])
def get_usuarios(
    search: Optional[str] = None,
    rol: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Lista todos los usuarios (Solo para personal con permisos)."""
    return auth_service.list_users(db, current_user.rol, search, rol)

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
