import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Modificando restricción de roles en la base de datos...")
    
    # 1. Eliminar la restricción antigua
    cur.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;")
    
    # 2. Crear la nueva restricción que incluye EMBAJADOR
    cur.execute("ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('ADMIN', 'ORGANIZADOR', 'EMBAJADOR', 'MIEMBRO'));")
    
    print("✅ Restricción 'usuarios_rol_check' actualizada correctamente para incluir 'EMBAJADOR'.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error al modificar la base de datos: {e}")
