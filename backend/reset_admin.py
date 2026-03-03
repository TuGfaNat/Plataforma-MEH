from app.database import SessionLocal
from app.models import models
from app.core import auth
from datetime import datetime

def clean_and_reset_admin():
    db = SessionLocal()
    try:
        print("Limpiando usuarios duplicados...")
        # Borrar todos los intentos de admin anteriores para evitar conflictos
        db.query(models.Usuario).filter(models.Usuario.correo == "admin@meh.com").delete()
        db.commit()

        print("Creando nuevo usuario admin único...")
        new_user = models.Usuario(
            nombres="Administrador",
            apellidos="MEH",
            correo="admin@meh.com",
            password_hash=auth.get_password_hash("admin123"),
            rol="ADMIN",
            fecha_registro=datetime.utcnow()
        )
        db.add(new_user)
        db.commit()
        print("✅ Usuario admin@meh.com recreado exitosamente.")
        print("🔑 Credenciales -> Correo: admin@meh.com | Pass: admin123")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_and_reset_admin()
