from app.database import engine
from sqlalchemy import text

def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Conexión exitosa a la base de datos!")
    except Exception as e:
        print(f"❌ Error al conectar: {e}")

if __name__ == "__main__":
    test_connection()
