from app.database import SessionLocal
from app.models import models
from datetime import datetime
import uuid

def seed_certificates():
    db = SessionLocal()
    try:
        # 1. Asegurar que existe al menos un curso
        curso = db.query(models.Curso).first()
        if not curso:
            curso = models.Curso(
                nombre_curso="Azure AI Fundamentals",
                descripcion="Certificación oficial de IA en la nube de Microsoft.",
                horas_academicas=20,
                estado="ACTIVO"
            )
            db.add(curso)
            db.commit()
            db.refresh(curso)
            print(f"✅ Curso creado: {curso.nombre_curso}")

        # 2. Obtener usuarios de prueba
        usuarios = db.query(models.Usuario).all()
        if not usuarios:
            print("❌ No hay usuarios en la base de datos. Ejecuta seed_users.py primero.")
            return

        # 3. Datos de certificados de prueba con UUIDs fijos para fácil testeo
        cert_test_data = [
            {"email": "admin@meh.com", "uuid": "550e8400-e29b-41d4-a716-446655440000", "cod": "MEH-ADM-001"},
            {"email": "miembro@meh.com", "uuid": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "cod": "MEH-MIE-002"},
            {"email": "lider@meh.com", "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "cod": "MEH-LID-003"}
        ]

        print("🚀 Sembrando certificados de prueba...")

        for data in cert_test_data:
            user = db.query(models.Usuario).filter(models.Usuario.correo == data["email"]).first()
            if user:
                # Limpiar si ya existe
                db.query(models.Certificado).filter(models.Certificado.uuid_verificacion == data["uuid"]).delete()
                db.commit()

                new_cert = models.Certificado(
                    id_usuario=user.id_usuario,
                    id_curso=curso.id_curso,
                    uuid_verificacion=data["uuid"],
                    codigo_verificacion=data["cod"],
                    fecha_emision=datetime.utcnow(),
                    url_pdf="static/certificados/test.pdf",
                    formato="DIGITAL",
                    es_ruta_linkedin=True
                )
                db.add(new_cert)
                print(f"✅ Certificado creado para {user.correo}: {data['uuid']}")
        
        db.commit()
        print("\n✨ Semilla de certificados completada.")
        print("Puedes usar estos códigos en el Validador de la Landing Page:")
        for data in cert_test_data:
            print(f"- {data['uuid']}")

    except Exception as e:
        print(f"❌ Error durante la siembra de certificados: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_certificates()
