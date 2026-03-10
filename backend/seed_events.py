from app.database import SessionLocal
from app.models import models
from datetime import datetime, timedelta

def seed_events():
    db = SessionLocal()
    try:
        # Obtener un organizador para asignar los eventos
        admin = db.query(models.Usuario).filter(models.Usuario.rol == 'ADMIN').first()
        if not admin:
            print("❌ No hay un Admin en la DB. Ejecuta seed_users.py primero.")
            return

        # Lista de eventos de ejemplo
        eventos_data = [
            {
                "titulo": "Workshop: IA Generativa con Azure OpenAI",
                "descripcion": "Aprende a construir aplicaciones inteligentes utilizando los modelos de lenguaje más avanzados de Microsoft. Cubriremos despliegue, seguridad y prompt engineering.",
                "fecha_inicio": datetime.now() + timedelta(days=5, hours=10),
                "modalidad": "VIRTUAL",
                "ubicacion": "Microsoft Teams",
                "capacidad_max": 100,
                "estado": "PROGRAMADO"
            },
            {
                "titulo": "Masterclass: Desarrollo con React y Fluent UI",
                "descripcion": "Diseña interfaces profesionales siguiendo los estándares de diseño de Microsoft. Veremos componentes, accesibilidad y tematización avanzada.",
                "fecha_inicio": datetime.now() + timedelta(days=12, hours=15),
                "modalidad": "VIRTUAL",
                "ubicacion": "YouTube Live / Portal MEH",
                "capacidad_max": 250,
                "estado": "PROGRAMADO"
            },
            {
                "titulo": "Meetup Presencial: Cloud Computing Day",
                "descripcion": "Un encuentro cara a cara para hablar sobre arquitectura de nube, redes y storage. ¡Habrá networking y pizzas al finalizar!",
                "fecha_inicio": datetime.now() + timedelta(days=20, hours=18),
                "modalidad": "PRESENCIAL",
                "ubicacion": "Auditorio Central de Ingeniería",
                "capacidad_max": 50,
                "estado": "PROGRAMADO"
            },
            {
                "titulo": "Hackathon: Innovando para el Bien Común",
                "descripcion": "24 horas de código intenso para crear soluciones tecnológicas que impacten positivamente en nuestra comunidad. Premios oficiales de Microsoft.",
                "fecha_inicio": datetime.now() + timedelta(days=30, hours=9),
                "modalidad": "HIBRIDO",
                "ubicacion": "Campus Universitario / Discord",
                "capacidad_max": 500,
                "estado": "PROGRAMADO"
            }
        ]

        print("🚀 Sembrando eventos de ejemplo en la comunidad...")

        for data in eventos_data:
            # Evitar duplicados por título
            existing = db.query(models.Evento).filter(models.Evento.titulo == data["titulo"]).first()
            if existing:
                db.delete(existing)
                db.commit()

            new_evento = models.Evento(
                **data,
                id_organizador=admin.id_usuario,
                creado_por=admin.id_usuario
            )
            db.add(new_evento)
            print(f"✅ Evento creado: {data['titulo']}")
        
        db.commit()
        print("\n✨ Calendario de eventos poblado con éxito.")
        print("Ya puedes verlos en la Landing Page.")

    except Exception as e:
        print(f"❌ Error durante la siembra de eventos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_events()
