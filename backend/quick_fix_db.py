import os
import psycopg2
from app.core import auth
from datetime import datetime

def try_connections():
    # Lista de posibles contraseñas comunes
    passwords = ['postgres', '', 'admin', '1234', 'root']
    
    for pwd in passwords:
        try:
            print(f"Probando con contraseña: '{pwd}'...")
            conn = psycopg2.connect(
                host="localhost",
                user="postgres",
                password=pwd,
                dbname="plataforma_meh",
                connect_timeout=3
            )
            print(f"✅ ¡CONEXIÓN EXITOSA! La contraseña es: '{pwd}'")
            
            # Si conectó, creamos el usuario de una vez
            cur = conn.cursor()
            hashed_pass = auth.get_password_hash("admin123")
            cur.execute("SELECT id_usuario FROM usuarios WHERE correo = 'admin@meh.com'")
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO usuarios (nombres, apellidos, correo, password_hash, rol) VALUES (%s, %s, %s, %s, %s)",
                    ("Admin", "Plataforma", "admin@meh.com", hashed_pass, "ADMIN")
                )
                conn.commit()
                print("✅ Usuario admin@meh.com creado.")
            else:
                print("ℹ️ El usuario ya existe.")
            
            conn.close()
            return True
        except Exception:
            continue
            
    print("❌ No se pudo conectar con ninguna contraseña común.")
    print("Por favor, verifica tu contraseña en pgAdmin y actualiza el archivo backend/.env")
    return False

if __name__ == "__main__":
    try_connections()
