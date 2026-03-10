from app.database import SessionLocal
from app.models import models

def check_users():
    db = SessionLocal()
    users = db.query(models.Usuario).all()
    print(f"Total usuarios en DB: {len(users)}")
    for u in users:
        print(f"- {u.correo} | Rol: {u.rol} | Nombre: {u.nombres}")
    db.close()

if __name__ == "__main__":
    check_users()
