from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import user as user_schema
from ..core import auth as auth_core
from datetime import timedelta

router = APIRouter(
    prefix="/auth",
    tags=["autenticacion"]
)

@router.post("/register", response_model=user_schema.UserResponse)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    # Verificar si el correo ya existe
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    # Crear nuevo usuario
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
def login(user_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):
    # Buscar usuario por correo
    user = db.query(models.Usuario).filter(models.Usuario.correo == user_credentials.correo).first()
    
    if not user or not auth_core.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generar token
    access_token = auth_core.create_access_token(
        data={"sub": user.correo, "rol": user.rol}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
