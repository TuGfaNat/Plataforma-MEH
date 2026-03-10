import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def fix_constraints():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Actualizando restricciones de la tabla de eventos...")
        
        # 1. Modalidad: Añadir HIBRIDO
        try:
            cur.execute("ALTER TABLE eventos DROP CONSTRAINT IF EXISTS eventos_modalidad_check;")
            cur.execute("ALTER TABLE eventos ADD CONSTRAINT eventos_modalidad_check CHECK (modalidad IN ('VIRTUAL', 'PRESENCIAL', 'HIBRIDO'));")
            print("✅ Restricción de modalidad actualizada.")
        except Exception as e:
            print(f"⚠️ Error en modalidad: {e}")

        # 2. Estado: Asegurar estados correctos
        try:
            cur.execute("ALTER TABLE eventos DROP CONSTRAINT IF EXISTS eventos_estado_check;")
            cur.execute("ALTER TABLE eventos ADD CONSTRAINT eventos_estado_check CHECK (estado IN ('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'));")
            print("✅ Restricción de estado actualizada.")
        except Exception as e:
            print(f"⚠️ Error en estado: {e}")

        print("✨ Restricciones sincronizadas.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error crítico: {e}")

if __name__ == "__main__":
    fix_constraints()
