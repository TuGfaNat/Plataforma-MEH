import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def fix_payments_table():
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Corrigiendo tabla de pagos...")
        
        def add_col(table, col, type):
            try:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {type};")
                print(f"✅ {table}.{col} añadida.")
            except:
                pass

        # Asegurar columnas críticas en Pagos
        add_col("pagos", "url_comprobante", "VARCHAR")
        add_col("pagos", "validado_por", "INTEGER REFERENCES usuarios(id_usuario)")
        add_col("pagos", "fecha_validacion", "TIMESTAMP")
        add_col("pagos", "notas_admin", "TEXT")

        print("✨ Tabla de pagos sincronizada.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_payments_table()
