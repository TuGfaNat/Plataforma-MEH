import sys
import os
import json

# Añadir el directorio raíz al path para poder importar app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import models
from app.core.logging import registrar_log

def test_full_login_flow():
    print("Simulando registro de log de inicio de sesión...")
    db = SessionLocal()
    try:
        user = db.query(models.Usuario).filter(models.Usuario.correo == 'admin@meh.com').first()
        if not user:
            print("❌ No se encontró el usuario admin@meh.com")
            return
        
        log = registrar_log(
            db=db,
            id_admin=user.id_usuario,
            accion="TEST_DEBUG",
            tabla_afectada="usuarios",
            id_registro_afectado=user.id_usuario,
            ip_direccion="127.0.0.1"
        )
        print(f"✅ Log registrado con éxito: ID {log.id_log}")
        
        # Limpiar el log de prueba
        db.delete(log)
        db.commit()
        print("✅ Log de prueba eliminado.")
        
    except Exception as e:
        print(f"❌ ERROR EN EL FLUJO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_full_login_flow()
