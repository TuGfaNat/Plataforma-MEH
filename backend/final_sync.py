import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def final_sync():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Sincronizando columnas de Eventos e Inscripciones...")
        
        def add_col(table, col, type):
            try:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {type};")
                print(f"✅ {table}.{col} añadida.")
            except Exception as e:
                # Si ya existe, ignoramos
                pass

        # Tabla Eventos
        add_col("eventos", "token_qr", "VARCHAR")
        add_col("eventos", "creado_por", "INTEGER REFERENCES usuarios(id_usuario)")
        add_col("eventos", "fecha_creacion", "TIMESTAMP DEFAULT NOW()")
        add_col("eventos", "modificado_por", "INTEGER REFERENCES usuarios(id_usuario)")
        add_col("eventos", "fecha_modificacion", "TIMESTAMP")
        
        # Tabla Inscripciones Eventos
        add_col("inscripciones_eventos", "asistio", "BOOLEAN DEFAULT FALSE")
        add_col("inscripciones_eventos", "fecha_validacion", "TIMESTAMP")
        add_col("inscripciones_eventos", "id_pago", "INTEGER REFERENCES pagos(id_pago)")

        print("✨ Base de datos lista para todos los perfiles.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    final_sync()
