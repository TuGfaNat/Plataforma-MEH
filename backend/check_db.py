import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

db_url = "postgresql://postgres:postgres@localhost/MEH"
default_url = "postgresql://postgres:postgres@localhost/postgres"

print("Checking connection to database 'MEH'...")
try:
    conn = psycopg2.connect(db_url)
    print("SUCCESS: Connected to 'MEH' database.")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"INFO: Could not connect to 'MEH' database: {e}")
    print("Attempting to connect to 'postgres' to create database 'MEH'...")
    try:
        conn = psycopg2.connect(default_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        cursor.execute('CREATE DATABASE "MEH";')
        print("SUCCESS: Created database 'MEH'.")
        cursor.close()
        conn.close()
    except Exception as ex:
        print(f"ERROR: Could not create database 'MEH': {ex}")
        sys.exit(1)
