from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    rol: str = "MIEMBRO"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    correo: EmailStr
    password: str

class UserResponse(UserBase):
    id_usuario: int
    fecha_registro: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None
    rol: Optional[str] = None
