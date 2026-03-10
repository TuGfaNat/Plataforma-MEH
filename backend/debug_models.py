import sys
import os

# Añadir el directorio raíz al path para poder importar app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import models

def debug_sqlalchemy():
    print("Verificando integridad de los modelos de SQLAlchemy...")
    db = SessionLocal()
    try:
        # Intentamos una consulta simple que involucre relaciones
        user = db.query(models.Usuario).first()
        if user:
            print(f"✅ Usuario encontrado: {user.correo}")
            print(f"✅ Relación pagos: {len(user.pagos)} pagos encontrados")
        else:
            print("⚠️ No hay usuarios para probar.")
        return True
    except Exception as e:
        print(f"❌ ERROR DETECTADO: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    debug_sqlalchemy()
