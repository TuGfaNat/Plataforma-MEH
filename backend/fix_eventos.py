import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def fix_eventos_columns():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Asegurando columnas en la tabla de eventos...")
        
        try:
            cur.execute("ALTER TABLE eventos ADD COLUMN fecha_fin TIMESTAMP;")
            print("✅ eventos.fecha_fin añadida.")
        except:
            pass

        print("✨ Tabla de eventos sincronizada.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_eventos_columns()
