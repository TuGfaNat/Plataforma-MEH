import requests
import time

def test_connection():
    print("Probando conexión con el backend en http://localhost:8000...")
    try:
        # Intentamos varias veces por si está reiniciando
        for i in range(3):
            try:
                response = requests.get("http://localhost:8000/")
                print(f"✅ Respuesta del backend (Intento {i+1}): {response.status_code}")
                print(f"Mensaje: {response.json()}")
                return True
            except Exception:
                print(f"⌛ Intento {i+1} fallido, reintentando...")
                time.sleep(2)
        return False
    except Exception as e:
        print(f"❌ Error total: {e}")
        return False

if __name__ == "__main__":
    if not test_connection():
        print("❌ El backend no responde. Asegúrate de que el servidor esté encendido (ej: uvicorn main:app)")
