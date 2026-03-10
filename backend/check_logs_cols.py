import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

def check_logs_columns():
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'logs_sistema'")
        columns = [c[0] for c in cur.fetchall()]
        print(f"Columnas en logs_sistema: {columns}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_logs_columns()
