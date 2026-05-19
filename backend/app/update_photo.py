import sys
import os

# Añadir el path para que reconozca el módulo app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal
from app.models import models

def update_nataly_photo():
    db = SessionLocal()
    try:
        email = "natalygemio@gmail.com"
        user = db.query(models.Usuario).filter(models.Usuario.correo == email).first()
        if user:
            # Una foto elegante para Nataly
            user.foto_url = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
            db.commit()
            print(f"✅ Foto de perfil de Nataly actualizada.")
        else:
            print(f"❌ Usuario no encontrado.")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_nataly_photo()
