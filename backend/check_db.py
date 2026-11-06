import sys
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/MEH")

# Extraer el nombre de la base de datos y la URL base por defecto (a postgres)
parsed = urlparse(db_url)
target_db = parsed.path.lstrip("/") or "MEH"

# Construir la URL para conectar a la base de datos administrativa 'postgres'
default_url = db_url.rsplit("/", 1)[0] + "/postgres"

print(f"Checking connection to database '{target_db}'...")
try:
    conn = psycopg2.connect(db_url)
    print(f"SUCCESS: Connected to '{target_db}' database.")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"INFO: Could not connect to '{target_db}' database: {e}")
    print(f"Attempting to connect to 'postgres' to create database '{target_db}'...")
    try:
        conn = psycopg2.connect(default_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        cursor.execute(f'CREATE DATABASE "{target_db}";')
        print(f"SUCCESS: Created database '{target_db}'.")
        cursor.close()
        conn.close()
    except Exception as ex:
        print(f"ERROR: Could not create database '{target_db}': {ex}")
        sys.exit(1)
