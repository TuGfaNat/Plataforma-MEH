from app.database import SessionLocal
from app.models import models
from datetime import datetime
import uuid

def create_test_certificates():
    db = SessionLocal()
    try:
        # Buscar el primer usuario disponible (generalmente admin o miembro del seed)
        user = db.query(models.Usuario).filter(models.Usuario.correo == 'admin@meh.com').first()
        if not user:
            user = db.query(models.Usuario).first()
        
        if not user:
            print("❌ No se encontró ningún usuario. Por favor ejecuta el seed primero.")
            return

        # Buscar el primer curso disponible
        curso = db.query(models.Curso).first()
        
        test_codes = [
            "MEH-2026-TEST-CERT",
            "MEH-2026-VALID-01",
            "MEH-2026-TALENTO"
        ]

        print(f"🚀 Creando {len(test_codes)} certificados de prueba para {user.correo}...")

        for code in test_codes:
            # Verificar si ya existe
            existing = db.query(models.Certificado).filter(models.Certificado.codigo_verificacion == code).first()
            if existing:
                print(f"⚠️ El código {code} ya existe. Saltando...")
                continue

            nuevo_cert = models.Certificado(
                id_usuario=user.id_usuario,
                id_curso=curso.id_curso if curso else None,
                codigo_verificacion=code,
                uuid_verificacion=str(uuid.uuid4()),
                url_pdf="https://ejemplo.com/certificado-test.pdf",
                fecha_emision=datetime.utcnow(),
                formato="DIGITAL",
                creado_por=user.id_usuario
            )
            db.add(nuevo_cert)
            print(f"✅ Certificado creado: {code}")

        db.commit()
        print("\n✨ ¡Listo! Ya puedes usar estos códigos en el Validador de Talento.")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_certificates()
