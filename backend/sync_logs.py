import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def sync_logs_schema():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Sincronizando tabla logs_sistema...")
        
        # Renombrar fecha a fecha_hora si existe
        try:
            cur.execute("ALTER TABLE logs_sistema RENAME COLUMN fecha TO fecha_hora;")
            print("✅ Columna 'fecha' renombrada a 'fecha_hora' en 'logs_sistema'.")
        except Exception as e:
            print(f"ℹ️ Info: No se pudo renombrar 'fecha' (tal vez ya se llama 'fecha_hora' o no existe): {e}")

        print("✨ Tabla logs_sistema sincronizada.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    sync_logs_schema()
