import sys
sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models import models

db = SessionLocal()
try:
    badges = db.query(models.Badge).all()
    print("--- BADGES ---")
    for b in badges:
        print(f"ID: {b.id_badge} | Nombre: {b.nombre_badge} | URL: {b.imagen_url} | Requisito: {b.requisito_nivel} | Estado: {b.id_estado if hasattr(b, 'id_estado') else 'N/A'}")
finally:
    db.close()
