from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
import json
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

def seed_complete_ecosystem():
    db = SessionLocal()
    print("🚀 Iniciando poblado del ecosistema completo...")

    try:
        # 1. LIMPIAR DATOS PREVIOS (Opcional, pero recomendado para un seed limpio)
        # Nota: En un entorno real esto se manejaría con cuidado.
        
        # 2. CREAR TODOS LOS ROLES DE USUARIO
        print("👤 Creando usuarios para cada rol...")
        roles_data = [
            {"nombres": "Admin", "apellidos": "Maestro", "correo": "admin@meh.com", "rol": "ADMIN", "alias": "TheBoss"},
            {"nombres": "Juan", "apellidos": "Organizador", "correo": "organizador@meh.com", "rol": "ORGANIZADOR", "alias": "JuanEvents"},
            {"nombres": "Sofia", "apellidos": "Soporte", "correo": "soporte@meh.com", "rol": "SOPORTE", "alias": "SofiaHelp"},
            {"nombres": "Marcos", "apellidos": "Moderador", "correo": "moderador@meh.com", "rol": "MODERADOR", "alias": "MarcosMod"},
            {"nombres": "Elena", "apellidos": "Embajadora", "correo": "embajador@meh.com", "rol": "EMBAJADOR", "alias": "ElenaVIP"},
            {"nombres": "Lucas", "apellidos": "Miembro", "correo": "miembro@meh.com", "rol": "MIEMBRO", "alias": "LucasDev"},
        ]

        users = {}
        password_hash = auth_core.get_password_hash("password123")

        for r in roles_data:
            db_user = db.query(models.Usuario).filter(models.Usuario.correo == r["correo"]).first()
            if not db_user:
                db_user = models.Usuario(
                    **r,
                    password_hash=password_hash,
                    fecha_registro=datetime.utcnow(),
                    fecha_creacion=datetime.utcnow(),
                    tipo_entidad="Profesional" if r["rol"] != "MIEMBRO" else "Estudiante",
                    es_nuevo=False
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
            users[r["rol"]] = db_user
            print(f"✅ Rol {r['rol']} listo: {r['correo']}")

        # 3. CREAR EVENTOS Y CURSOS
        print("📅 Creando contenidos...")
        
        # Evento 1: Futuro (Para inscripciones)
        evento_futuro = models.Evento(
            titulo="Cumbre de IA 2026",
            descripcion="El futuro de la inteligencia artificial en Bolivia.",
            fecha_inicio=datetime.utcnow() + timedelta(days=15),
            modalidad="PRESENCIAL",
            capacidad_max=100,
            ubicacion="Auditorio Central UMSA",
            id_organizador=users["ORGANIZADOR"].id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento_futuro)
        
        # Curso 1: VIP (Para Embajadores)
        curso_python = models.Curso(
            nombre_curso="Masterclass: Python Arquitectura",
            descripcion="Patrones de diseño avanzados.",
            horas_academicas=40,
            id_instructor=users["ORGANIZADOR"].id_usuario,
            estado="ACTIVO"
        )
        db.add(curso_python)
        db.commit()

        # 4. CREAR ESCENARIOS DE NEGOCIO
        print("🧪 Generando escenarios de prueba...")

        # Escenario A: Miembro con pago PENDIENTE (Para que Soporte lo valide)
        ins_pend = models.InscripcionEvento(
            id_usuario=users["MIEMBRO"].id_usuario,
            id_evento=evento_futuro.id_evento,
            estado_inscripcion="PENDIENTE",
            codigo_qr=str(uuid.uuid4())
        )
        db.add(ins_pend)
        db.commit()
        
        pago_pend = models.Pago(
            id_usuario=users["MIEMBRO"].id_usuario,
            monto=100.00,
            metodo_pago="QR_BANCARIO",
            estado_pago="PENDIENTE",
            id_referencia=evento_futuro.id_evento,
            tipo_referencia="EVENTO",
            url_comprobante="static/comprobantes/seed_pendiente.png",
            fecha_pago=datetime.utcnow()
        )
        db.add(pago_pend)
        db.commit()
        ins_pend.id_pago = pago_pend.id_pago
        db.commit()

        # Escenario B: Embajador con acceso a Recursos VIP
        recurso_vip = models.Recurso(
            titulo="Guía de Arquitectura MEH",
            descripcion="Documento confidencial para líderes.",
            categoria="VIP",
            tipo_recurso="ARCHIVO",
            url_descarga="static/uploads/guia_arquitectura.pdf",
            creado_por=users["ADMIN"].id_usuario
        )
        db.add(recurso_vip)

        # Escenario C: Moderador con Speaker Kit
        recurso_mod = models.Recurso(
            titulo="Plantilla PPT MEH 2026",
            descripcion="Diseño oficial para ponentes.",
            categoria="SPEAKER",
            tipo_recurso="LINK",
            url_descarga="https://onedrive.com/template",
            creado_por=users["ORGANIZADOR"].id_usuario
        )
        db.add(recurso_mod)
        db.commit()

        # 5. LOGS PARA EL ADMIN
        print("🛡️ Registrando actividad inicial...")
        log_entry = models.LogSistema(
            id_admin=users["ADMIN"].id_usuario,
            accion="SEED_SYSTEM_ECOSYSTEM",
            tabla_afectada="all",
            valor_nuevo="{'status': 'success', 'data': 'complete_roles'}",
            ip_direccion="127.0.0.1"
        )
        db.add(log_entry)
        db.commit()

        print("\n✅ ECOSISTEMA CREADO!")
        print("--------------------------------------------------")
        print("🔑 TODAS LAS CONTRASEÑAS SON: password123")
        print("1. ADMIN: admin@meh.com -> Ve todo y auditoría.")
        print("2. ORGANIZADOR: organizador@meh.com -> Gestiona eventos.")
        print("3. SOPORTE: soporte@meh.com -> Ve el pago de Lucas en 'Validar Pagos'.")
        print("4. MODERADOR: moderador@meh.com -> Ve el Speaker Kit.")
        print("5. EMBAJADOR: embajador@meh.com -> Ve Recursos VIP.")
        print("6. MIEMBRO: miembro@meh.com -> Ve su inscripción pendiente.")
        print("--------------------------------------------------")

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_complete_ecosystem()
