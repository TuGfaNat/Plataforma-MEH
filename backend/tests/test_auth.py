import pytest
from app.core import auth as auth_core
from datetime import timedelta
from jose import jwt

def test_create_access_token():
    """Valida la creación de un token JWT válido"""
    data = {"sub": "test@meh.com", "rol": "ADMIN"}
    token = auth_core.create_access_token(data=data, expires_delta=timedelta(minutes=15))
    
    assert token is not None
    assert isinstance(token, str)

def test_verify_access_token():
    """Valida la decodificación y contenido del token"""
    data = {"sub": "user@example.com", "rol": "MIEMBRO"}
    token = auth_core.create_access_token(data=data)
    
    # Usamos la lógica interna para verificar (simulando lo que hace el middleware)
    payload = jwt.decode(token, auth_core.SECRET_KEY, algorithms=[auth_core.ALGORITHM])
    
    assert payload["sub"] == "user@example.com"
    assert payload["rol"] == "MIEMBRO"
    assert "exp" in payload

def test_password_hashing():
    """Valida que el hashing de contraseñas sea seguro y verificable"""
    password = "PasswordSegura123!"
    hashed = auth_core.get_password_hash(password)
    
    assert hashed != password
    assert auth_core.verify_password(password, hashed) is True
    assert auth_core.verify_password("PasswordIncorrecta", hashed) is False
