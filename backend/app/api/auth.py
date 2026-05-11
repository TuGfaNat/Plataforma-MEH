from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt

from ..database import get_db
from ..models import models
from ..schemas import user as user_schema
from ..core import auth as auth_core
from ..services import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["autenticacion"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth_core.SECRET_KEY, algorithms=[auth_core.ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
        token_data = user_schema.TokenData(correo=correo)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.Usuario).filter(models.Usuario.correo == token_data.correo).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=user_schema.UserResponse)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user)

@router.post("/login", response_model=user_schema.Token)
def login(request: Request, user_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):
    ip_address = request.client.host if request.client else None
    return auth_service.login_user(db, user_credentials, ip_address)

@router.post("/google", response_model=user_schema.Token)
def google_login(request: Request, token_data: dict, db: Session = Depends(get_db)):
    ip_address = request.client.host if request.client else None
    return auth_service.login_with_google(db, token_data["token"], ip_address)

@router.get("/me", response_model=user_schema.UserResponse)
def read_users_me(current_user: models.Usuario = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=user_schema.UserResponse)
def update_user_me(
    request: Request,
    user_update: user_schema.UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return auth_service.update_profile(db, current_user, user_update, ip_address)


@router.get("/usuarios", response_model=List[user_schema.UserResponse])
def get_usuarios(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    from ..core.permissions import ensure_admin
    ensure_admin(current_user.rol)
    return auth_service.list_users(db, current_user)

@router.put("/usuarios/{id_usuario}/rol")
def update_user_role(
    id_usuario: int,
    nuevo_rol: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    from ..core.permissions import ensure_admin
    ensure_admin(current_user.rol)
    ip_address = request.client.host if request.client else None
    return auth_service.update_user_role(db, current_user, id_usuario, nuevo_rol, ip_address)
