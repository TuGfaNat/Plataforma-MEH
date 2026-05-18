from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.database import SessionLocal, engine
from app.models import models
from app.services import auth_service, eventos_service, inscripciones_service, pagos_service
from app.schemas import user as user_schema, evento as evento_schema, pago as pago_schema
from app.core import auth as auth_core

def seed_data():
    db = SessionLocal()
    print("🚀 Iniciando poblado de datos (Seeding)...")

    try:
        # 1. CREAR USUARIOS (ADMIN, ORGANIZADOR, MIEMBROS)
        print("👤 Creando usuarios...")
        users_to_create = [
            {"nombres": "Admin", "apellidos": "Plataforma", "correo": "admin@meh.com", "rol": "ADMIN", "alias": "SuperAdmin"},
            {"nombres": "Juan", "apellidos": "Organizador", "correo": "organizador@meh.com", "rol": "ORGANIZADOR", "alias": "JuanEvents"},
            {"nombres": "Maria", "apellidos": "Miembro", "correo": "miembro@meh.com", "rol": "MIEMBRO", "alias": "MariaDev"},
            {"nombres": "Carlos", "apellidos": "Estudiante", "correo": "carlos@gmail.com", "rol": "MIEMBRO", "alias": "Carlitos", "tipo_entidad": "Estudiante"},
            {"nombres": "Ana", "apellidos": "Profesional", "correo": "ana@outlook.com", "rol": "MIEMBRO", "alias": "AnaPro", "tipo_entidad": "Profesional"},
        ]

        created_users = []
        for i, u in enumerate(users_to_create):
            # Usamos el servicio para asegurar que se aplique el hash de password y logs
            user_in = user_schema.UserCreate(
                password="password123",
                **u
            )
            try:
                # El primer usuario no puede ser creado por nadie (None)
                # Para evitar violar la FK de usuarios_creado_por_fkey
                password_hash = auth_core.get_password_hash(user_in.password)
                
                db_user = models.Usuario(
                    nombres=user_in.nombres,
                    apellidos=user_in.apellidos,
                    correo=user_in.correo,
                    password_hash=password_hash,
                    rol=u["rol"],
                    alias=u.get("alias"),
                    tipo_entidad=u.get("tipo_entidad", "Estudiante"),
                    fecha_registro=datetime.utcnow(),
                    creado_por=None, # IMPORTANTE: Evita FK error
                    fecha_creacion=datetime.utcnow()
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                print(f"✅ Usuario creado: {u['correo']}")
                created_users.append(db_user)
            except Exception as e:
                db.rollback()
                print(f"⚠️ Error creando usuario {u['correo']}: {str(e)}")
                db_user = db.query(models.Usuario).filter(models.Usuario.correo == u["correo"]).first()
                if db_user:
                    created_users.append(db_user)

        admin_user = created_users[0]
        org_user = created_users[1]

        # 2. CREAR EVENTOS
        print("📅 Creando eventos...")
        eventos_data = [
            {
                "titulo": "Workshop de Azure Fundamentals",
                "descripcion": "Aprende las bases de la nube de Microsoft.",
                "fecha_inicio": datetime.utcnow() + timedelta(days=7),
                "modalidad": "VIRTUAL",
                "capacidad_max": 50,
                "ubicacion": "Microsoft Teams"
            },
            {
                "titulo": "MEH Conf 2026",
                "descripcion": "El evento tecnológico más grande de la comunidad.",
                "fecha_inicio": datetime.utcnow() + timedelta(days=30),
                "modalidad": "PRESENCIAL",
                "capacidad_max": 200,
                "ubicacion": "Auditorio UMSA, La Paz"
            },
            {
                "titulo": "Taller de IA Generativa",
                "descripcion": "Creación de agentes inteligentes con OpenAI.",
                "fecha_inicio": datetime.utcnow() - timedelta(days=5),
                "modalidad": "HIBRIDO",
                "capacidad_max": 30,
                "ubicacion": "Hub Tecnológico"
            }
        ]

        created_events = []
        for ev in eventos_data:
            ev_in = evento_schema.EventoCreate(**ev)
            db_ev = eventos_service.create_evento(db, admin_user, ev_in)
            created_events.append(db_ev)

        # 3. INSCRIPCIONES Y PAGOS
        print("💳 Creando inscripciones y simulando pagos...")
        # Miembro 1 se inscribe a 2 eventos
        miembro = created_users[2]
        
        # Inscripción 1: Workshop Azure (Pendiente)
        ins1 = inscripciones_service.inscribir_evento(db, miembro.id_usuario, created_events[0].id_evento)
        
        # Inscripción 2: MEH Conf (Pagada y Confirmada)
        ins2 = inscripciones_service.inscribir_evento(db, miembro.id_usuario, created_events[1].id_evento)
        # Subir comprobante ficticio
        pago = models.Pago(
            id_usuario=miembro.id_usuario,
            monto=150.00,
            metodo_pago="TRANSFERENCIA",
            estado_pago="APROBADO",
            id_referencia=created_events[1].id_evento,
            tipo_referencia="EVENTO",
            url_comprobante="static/comprobantes/seed_test.jpg",
            validado_por=admin_user.id_usuario,
            fecha_validacion=datetime.utcnow()
        )
        db.add(pago)
        db.commit()
        # Confirmar inscripción manualmente para el seed
        ins2.id_pago = pago.id_pago
        ins2.estado_inscripcion = "CONFIRMADA"
        db.commit()

        # 4. CREAR CURSOS
        print("🎓 Creando cursos...")
        cursos_data = [
            {"nombre_curso": "Python para Data Science", "descripcion": "Domina Pandas y Numpy", "horas_academicas": 40},
            {"nombre_curso": "React + Fluent UI", "descripcion": "Interfaces modernas", "horas_academicas": 20}
        ]
        
        for c in cursos_data:
            db_curso = models.Curso(**c, instructor=org_user)
            db.add(db_curso)
        db.commit()

        # 5. CREAR LOGS DE AUDITORÍA
        print("🛡️ Generando logs de actividad...")
        # (Los servicios ya generan algunos, pero agregamos manuales)
        log = models.LogSistema(
            id_admin=admin_user.id_usuario,
            accion="CONFIGURACION_SISTEMA",
            tabla_afectada="configuracion_global",
            id_registro_afectado=1,
            valor_nuevo="{'mantenimiento': False}",
            ip_direccion="127.0.0.1"
        )
        db.add(log)
        db.commit()

        print("✅ Poblado completado con éxito!")
        print(f"📊 Resumen: {len(created_users)} usuarios, {len(created_events)} eventos, 1 pago validado.")

    except Exception as e:
        print(f"❌ ERROR durante el seeding: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
