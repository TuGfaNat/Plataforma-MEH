import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def apply_global_audit():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        tables = ["pagos", "cursos", "certificados", "anuncios", "inscripciones_eventos", "inscripciones_cursos"]
        
        print("🚀 Aplicando estándares de auditoría global a la base de datos...")

        def add_audit_cols(table):
            cols_to_add = [
                ("creado_por", "INTEGER REFERENCES usuarios(id_usuario)"),
                ("fecha_creacion", "TIMESTAMP DEFAULT NOW()"),
                ("modificado_por", "INTEGER REFERENCES usuarios(id_usuario)"),
                ("fecha_modificacion", "TIMESTAMP")
            ]
            for col, type_ in cols_to_add:
                try:
                    cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {type_};")
                    print(f"  ✅ {table}.{col} añadida.")
                except:
                    pass

        for table in tables:
            add_audit_cols(table)

        print("\n✨ TODAS las tablas principales ahora cuentan con rastreo de auditoría.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error durante la auditoría global: {e}")

if __name__ == "__main__":
    apply_global_audit()
