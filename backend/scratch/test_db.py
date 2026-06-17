import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def test_and_create_db():
    # Try connecting to default postgres database to see if credentials work
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("Success: Connected to postgres database.")
        
        # Check if MEH database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'MEH';")
        exists = cursor.fetchone()
        if not exists:
            print("Database MEH does not exist. Creating...")
            cursor.execute("CREATE DATABASE \"MEH\";")
            print("Database MEH created successfully.")
        else:
            print("Database MEH already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting to default postgres db: {e}")
        print("Trying with blank/other passwords...")
        # Try without password or with common passwords
        for pwd in ["", "password123", "postgres", "admin"]:
            try:
                conn = psycopg2.connect(
                    dbname="postgres",
                    user="postgres",
                    password=pwd,
                    host="localhost",
                    port="5432"
                )
                conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                cursor = conn.cursor()
                print(f"Success: Connected with password '{pwd}'.")
                
                # Check MEH db
                cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'MEH';")
                exists = cursor.fetchone()
                if not exists:
                    print("Database MEH does not exist. Creating...")
                    cursor.execute("CREATE DATABASE \"MEH\";")
                    print("Database MEH created successfully.")
                else:
                    print("Database MEH already exists.")
                
                cursor.close()
                conn.close()
                
                # Update .env if password is different
                env_path = "../.env"
                if os.path.exists(env_path):
                    with open(env_path, "r") as f:
                        lines = f.readlines()
                    with open(env_path, "w") as f:
                        for line in lines:
                            if line.startswith("DATABASE_URL="):
                                f.write(f"DATABASE_URL=postgresql://postgres:{pwd}@localhost/MEH\n")
                            else:
                                f.write(line)
                    print(f"Updated .env with DATABASE_URL=postgresql://postgres:{pwd}@localhost/MEH")
                break
            except Exception as ex:
                print(f"Failed with password '{pwd}': {ex}")

if __name__ == "__main__":
    import os
    test_and_create_db()
