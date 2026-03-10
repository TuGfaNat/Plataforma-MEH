import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def sync_schema():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Sincronizando esquema de base de datos...")
        
        # Helper para añadir columnas si no existen
        def add_column(table, column, type):
            try:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type};")
                print(f"✅ Columna '{column}' añadida a '{table}'.")
            except psycopg2.errors.DuplicateColumn:
                pass
            except Exception as e:
                print(f"⚠️ Error al añadir '{column}' a '{table}': {e}")

        # Usuarios
        add_column("usuarios", "creado_por", "INTEGER")
        add_column("usuarios", "fecha_creacion", "TIMESTAMP DEFAULT NOW()")
        add_column("usuarios", "modificado_por", "INTEGER")
        add_column("usuarios", "fecha_modificacion", "TIMESTAMP")
        
        # Cursos
        add_column("cursos", "imagen_url", "VARCHAR")
        
        # Certificados
        add_column("certificados", "uuid_verificacion", "VARCHAR UNIQUE")
        add_column("certificados", "es_ruta_linkedin", "BOOLEAN DEFAULT FALSE")
        add_column("certificados", "metadata_adicional", "TEXT")
        
        # Intentar corregir nombres de columnas si existen erratas antiguas
        try:
            cur.execute("ALTER TABLE certificados RENAME COLUMN formate TO formato;")
            print("✅ Columna 'formate' renombrada a 'formato' en 'certificados'.")
        except:
            pass

        print("✨ Esquema sincronizado correctamente.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error crítico en sincronización: {e}")

if __name__ == "__main__":
    sync_schema()
