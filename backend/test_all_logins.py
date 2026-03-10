import sys
import os

# Añadir el directorio raíz al path para poder importar app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import models
from app.core import auth

def test_all_logins():
    db = SessionLocal()
    credentials = [
        ("admin@meh.com", "admin123"),
        ("staff@meh.com", "staff123"),
        ("lider@meh.com", "lider123"),
        ("miembro@meh.com", "miembro123")
    ]
    
    print("Verificando capacidad de login para todos los perfiles...")
    for correo, password in credentials:
        user = db.query(models.Usuario).filter(models.Usuario.correo == correo).first()
        if not user:
            print(f"❌ Usuario {correo} NO existe.")
            continue
            
        if auth.verify_password(password, user.password_hash):
            print(f"✅ Login manual válido para: {correo} ({user.rol})")
        else:
            print(f"❌ Password incorrecta para: {correo}")
    db.close()

if __name__ == "__main__":
    test_all_logins()
