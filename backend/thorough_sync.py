import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def thorough_sync():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Sincronización profunda del esquema...")

        def add_col(table, col, type):
            try:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {type};")
                print(f"✅ {table}.{col} añadida.")
            except:
                pass

        # Tabla Certificados
        add_col("certificados", "id_curso", "INTEGER REFERENCES cursos(id_curso)")
        add_col("certificados", "id_evento", "INTEGER REFERENCES eventos(id_evento)")
        add_col("certificados", "uuid_verificacion", "VARCHAR UNIQUE")
        add_col("certificados", "es_ruta_linkedin", "BOOLEAN DEFAULT FALSE")
        add_col("certificados", "metadata_adicional", "TEXT")
        
        # Tabla Cursos
        add_col("cursos", "imagen_url", "VARCHAR")

        print("✨ Sincronización completada.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    thorough_sync()
