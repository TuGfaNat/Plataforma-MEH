import os
import psycopg2
from app.core import auth
from app.database import SQLALCHEMY_DATABASE_URL
from datetime import datetime

def seed_user_raw():
    print(f"Probando conexión a: {SQLALCHEMY_DATABASE_URL}")
    
    conn = None
    try:
        # Intentamos conectar directamente con psycopg2 para tener más control
        conn = psycopg2.connect(SQLALCHEMY_DATABASE_URL)
        # Forzamos a que la sesión use UTF8
        conn.set_client_encoding('UTF8')
        cur = conn.cursor()
        
        # Verificar si el usuario ya existe
        cur.execute("SELECT id_usuario FROM usuarios WHERE correo = %s", ("admin@meh.com",))
        user = cur.fetchone()
        
        if not user:
            hashed_pass = auth.get_password_hash("admin123")
            cur.execute(
                """
                INSERT INTO usuarios (nombres, apellidos, correo, password_hash, rol, fecha_registro)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                ("Admin", "Plataforma", "admin@meh.com", hashed_pass, "ADMIN", datetime.utcnow())
            )
            conn.commit()
            print("✅ EXITO: Usuario admin@meh.com creado (password: admin123)")
        else:
            print("ℹ️ INFO: El usuario ya existe.")
            
        cur.close()
    except Exception as e:
        print("\n❌ ERROR DE CONEXIÓN:")
        # Intentamos mostrar el error incluso si tiene caracteres raros
        try:
            print(str(e).encode('latin-1').decode('cp1252'))
        except:
            print(str(e))
            
        print("\n💡 SUGERENCIA: Verifica que tu usuario sea 'postgres' y la contraseña sea 'postgres'.")
        print("Si tu contraseña es distinta, cámbiala en el archivo backend/.env")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_user_raw()
