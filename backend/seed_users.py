from app.database import SessionLocal
from app.models import models
from app.core import auth
from datetime import datetime

def seed_test_users():
    db = SessionLocal()
    try:
        # Definición de usuarios para cada nivel de la plataforma
        usuarios_data = [
            {
                "nombres": "Admin",
                "apellidos": "MEH",
                "correo": "admin@meh.com",
                "password": "admin123",
                "rol": "ADMIN"
            },
            {
                "nombres": "Carlos",
                "apellidos": "Organizador",
                "correo": "staff@meh.com",
                "password": "staff123",
                "rol": "ORGANIZADOR"
            },
            {
                "nombres": "Ana",
                "apellidos": "Embajadora",
                "correo": "lider@meh.com",
                "password": "lider123",
                "rol": "EMBAJADOR"
            },
            {
                "nombres": "Juan",
                "apellidos": "Miembro",
                "correo": "miembro@meh.com",
                "password": "miembro123",
                "rol": "MIEMBRO"
            }
        ]

        print("🚀 Iniciando siembra de usuarios de prueba...")

        for data in usuarios_data:
            # Buscar el usuario existente
            user_to_delete = db.query(models.Usuario).filter(models.Usuario.correo == data["correo"]).first()
            if user_to_delete:
                # Limpiar logs asociados para evitar error de llave foránea
                db.query(models.LogSistema).filter(models.LogSistema.id_admin == user_to_delete.id_usuario).delete()
                # Borrar el usuario
                db.delete(user_to_delete)
                db.commit()

            new_user = models.Usuario(
                nombres=data["nombres"],
                apellidos=data["apellidos"],
                correo=data["correo"],
                password_hash=auth.get_password_hash(data["password"]),
                rol=data["rol"],
                fecha_registro=datetime.utcnow()
            )
            db.add(new_user)
            print(f"✅ Usuario creado: {data['correo']} (Rol: {data['rol']})")
        
        db.commit()
        print("\n✨ Todos los usuarios de prueba están listos.")
        print("Usa las contraseñas indicadas (ej: admin123) para entrar al portal.")
            
    except Exception as e:
        print(f"❌ Error durante la siembra: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_users()
