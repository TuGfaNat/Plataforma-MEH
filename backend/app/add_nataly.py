import sys
import os

# Añadir el path para que reconozca el módulo app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core
from datetime import datetime

def add_nataly():
    db = SessionLocal()
    print("👤 Registrando a Nataly Gemio...")
    
    try:
        email = "natalygemio@gmail.com"
        user = db.query(models.Usuario).filter(models.Usuario.correo == email).first()
        
        if not user:
            password_hash = auth_core.get_password_hash("password123")
            user = models.Usuario(
                nombres="Nataly",
                apellidos="Gemio",
                correo=email,
                password_hash=password_hash,
                rol="ADMIN",
                alias="Nataly_Gemio",
                institucion="Plataforma MEH",
                bio="Líder y visionaria de la Plataforma MEH. Impulsando la tecnología en Bolivia.",
                tipo_entidad="Profesional",
                preferencia_tema="dark",
                fecha_registro=datetime.utcnow(),
                es_nuevo=False
                # Nota: La tabla usuarios según models.py no tiene columna 'celular' directamente, 
                # pero se puede guardar en la bio o campos de contacto si existieran.
                # Como no existe 'telefono' en el modelo Usuario, lo omito para evitar errores de SQL.
            )
            db.add(user)
            db.commit()
            print(f"✅ ¡Bienvenida Nataly! Usuario {email} creado como ADMIN.")
        else:
            print(f"ℹ️ El usuario {email} ya existe.")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_nataly()
