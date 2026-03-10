import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def thorough_fix_eventos():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Sincronización completa de la tabla de eventos...")
        
        def add_col(col, type):
            try:
                cur.execute(f"ALTER TABLE eventos ADD COLUMN {col} {type};")
                print(f"✅ eventos.{col} añadida.")
            except:
                pass

        add_col("fecha_fin", "TIMESTAMP")
        add_col("ubicacion", "VARCHAR")
        add_col("imagen_url", "VARCHAR")
        add_col("token_qr", "VARCHAR")
        add_col("creado_por", "INTEGER REFERENCES usuarios(id_usuario)")
        add_col("fecha_creacion", "TIMESTAMP DEFAULT NOW()")
        add_col("modificado_por", "INTEGER REFERENCES usuarios(id_usuario)")
        add_col("fecha_modificacion", "TIMESTAMP")

        print("✨ Tabla de eventos sincronizada al 100%.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    thorough_fix_eventos()
