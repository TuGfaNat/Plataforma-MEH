import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def check_auditing_columns():
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        tables = ["usuarios", "eventos", "pagos", "cursos", "certificados", "anuncios"]
        audit_cols = ["creado_por", "fecha_creacion", "modificado_por", "fecha_modificacion"]
        
        print(f"{'TABLA':<15} | {'ESTADO DE AUDITORÍA'}")
        print("-" * 40)
        
        for table in tables:
            cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
            cols = [c[0] for c in cur.fetchall()]
            
            missing = [ac for ac in audit_cols if ac not in cols]
            
            if not missing:
                print(f"{table:<15} | ✅ COMPLETA")
            else:
                print(f"{table:<15} | ❌ Faltan: {', '.join(missing)}")
                
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_auditing_columns()
