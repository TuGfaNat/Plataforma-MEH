from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from ..database import get_db
from ..models import models
from ..schemas import user as user_schema
from ..core import auth as auth_core
from ..core.logging import registrar_log
from datetime import datetime, timedelta

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
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    hashed_password = auth_core.get_password_hash(user.password)
    new_user = models.Usuario(
        nombres=user.nombres,
        apellidos=user.apellidos,
        correo=user.correo,
        password_hash=hashed_password,
        rol=user.rol
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=user_schema.Token)
def login(request: Request, user_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.correo == user_credentials.correo).first()
    if not user or not auth_core.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})
    registrar_log(
        db=db, id_admin=user.id_usuario, accion="INICIO_SESION",
        tabla_afectada="usuarios", id_registro_afectado=user.id_usuario, ip_direccion=request.client.host
    )
    return {"access_token": access_token, "token_type": "bearer"}

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
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    current_user.fecha_modificacion = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    registrar_log(
        db=db, id_admin=current_user.id_usuario, accion="ACTUALIZAR_PERFIL",
        tabla_afectada="usuarios", id_registro_afectado=current_user.id_usuario,
        valor_nuevo=update_data, ip_direccion=request.client.host
    )
    return current_user
