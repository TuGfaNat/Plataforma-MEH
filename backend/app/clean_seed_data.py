import logging
from sqlalchemy import text
from app.database import SessionLocal
from app.models import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Correos reales que NUNCA deben borrarse bajo ninguna circunstancia
PROTECTED_WHITELIST_EMAILS = {
    'natalygemio@gmail.com',
    'dayelinodalisquispelimachi@gmail.com',
    'coralain2703@gmail.com',
    'krrishangelo@gmail.com',
    'admin@meh.com'
}

# Títulos de eventos semilla (super_seed.py)
SEED_EVENT_TITLES = [
    "Cloud Computing Summit",
    "Taller de Python para Data Science",
    "Networking Tech La Paz",
    "Hackathon MEH 2026",
    "Seminario de Ciberseguridad",
    "Azure DevOps Bootcamp",
    "Introducción a la Inteligencia Artificial",
    "Introduccion a la Inteligencia Artificial",
    "Desarrollo de Mobile Apps con MAUI",
    "Microsoft Student Ambassadors Meetup",
    "Workshop de PowerBI Avanzado",
    "Imagine Cup Bolivia 2026 - Mentoría",
    "Imagine Cup Bolivia 2026 - Mentoria"
]

# Nombres de cursos semilla
SEED_COURSE_NAMES = [
    "Fullstack React & FastAPI",
    "Azure Administrator (AZ-104)",
    "Introducción a Rust",
    "Introduccion a Rust"
]

def clean_database():
    db = SessionLocal()
    try:
        logger.info("======================================================")
        logger.info("🧹 INICIANDO LIMPIEZA TOTAL DE DATOS SEMILLA Y TEST")
        logger.info("======================================================")

        # 0. Obtener ID del SuperAdmin Nataly Gemio para reasignación de autoría
        nataly = db.query(models.Usuario).filter(models.Usuario.correo == 'natalygemio@gmail.com').first()
        nataly_id = nataly.id_usuario if nataly else None
        if not nataly_id:
            fallback_admin = db.query(models.Usuario).filter(models.Usuario.rol == 'ADMIN').first()
            nataly_id = fallback_admin.id_usuario if fallback_admin else 1

        # 1. Identificar usuarios semilla / test
        sql_find_seed_users = text("""
            SELECT id_usuario, correo, nombres, apellidos FROM usuarios
            WHERE correo NOT IN ('natalygemio@gmail.com', 'dayelinodalisquispelimachi@gmail.com', 'coralain2703@gmail.com', 'krrishangelo@gmail.com', 'admin@meh.com')
              AND (
                  correo LIKE 'user%@test.com'
                  OR alias LIKE 'dev_%'
                  OR correo LIKE '%@test.com'
                  OR correo LIKE '%@example.com'
                  OR correo LIKE '%@realdomain.org'
                  OR correo LIKE '%_e2e_%'
                  OR correo LIKE 'test_%'
                  OR correo LIKE 'admin_test_%'
                  OR correo LIKE 'admin_http_%'
                  OR correo LIKE 'staff_http_%'
                  OR correo LIKE 'alumno_http_%'
                  OR correo LIKE 'admin_undo_%'
                  OR correo LIKE 'staff_undo_%'
                  OR correo LIKE 'admin_hist_%'
                  OR correo LIKE 'staff_hist_%'
                  OR correo LIKE 'admin_acred_%'
                  OR correo LIKE 'org_acred_%'
                  OR correo LIKE 'miembro_%'
                  OR correo LIKE 'carlos_%'
                  OR correo LIKE 'alice_%'
                  OR correo LIKE 'bob_%'
                  OR correo LIKE 'org_%'
                  OR correo LIKE 'op_%'
                  OR correo LIKE 'staff_scan_%'
                  OR correo LIKE 'admin_em_%'
                  OR correo LIKE 'admin_cad_%'
                  OR correo LIKE 'org_em_%'
                  OR correo LIKE 'emb_cad_%'
                  OR correo LIKE 'miembro_em_%'
                  OR correo LIKE 'miembro_cad_%'
                  OR correo LIKE 'user_life_%'
                  OR correo LIKE 'admin_017_%'
                  OR correo LIKE 'admin_019_%'
                  OR correo LIKE 'ana_019_%'
                  OR correo LIKE 'beatriz_017_%'
                  OR correo LIKE 'diego_017_%'
                  OR correo LIKE 'lucas_offline_%'
                  OR correo LIKE 'maria_gomez_%'
                  OR correo LIKE 'admin_life_%'
                  OR correo LIKE 'ana_v_%'
                  OR correo LIKE 'maria_stud_%'
                  OR correo LIKE 'juan_choque_%'
                  OR correo LIKE 'alumno_%'
                  OR correo LIKE 'otro_staff_%'
                  OR correo LIKE 'inscrito_%'
                  OR correo LIKE 'noinsc_%'
                  OR correo LIKE 'lucia_real_%'
                  OR correo LIKE '%@meh.com'
                  OR correo = 'audit_test@meh.com'
                  OR correo = 'carlos@gmail.com'
                  OR correo = 'ana@outlook.com'
              )
        """)
        seed_users = db.execute(sql_find_seed_users).fetchall()
        seed_user_ids = [row[0] for row in seed_users]
        logger.info(f"👥 Cuentas semilla/test detectadas para eliminación: {len(seed_user_ids)}")

        # 2. Identificar eventos semilla / test
        sql_find_seed_events = text("""
            SELECT id_evento, titulo FROM eventos
            WHERE titulo IN :seed_titles
               OR titulo LIKE '%E2E%'
               OR titulo LIKE '%Simposio Undo%'
               OR titulo LIKE '%Conferencia Historial%'
               OR titulo LIKE '%HTTP Event%'
               OR titulo LIKE '%Evento Test Directorio%'
               OR titulo LIKE '%Py_% Avanzado%'
               OR titulo LIKE '%Py_% Básico%'
               OR titulo LIKE '%Py_% Basico%'
               OR titulo LIKE '%Py_% Presencial%'
               OR titulo LIKE '%Summit de Pagos MEH%'
               OR titulo LIKE '%Conferencia MEH 2026 %'
               OR titulo LIKE '%Tech Day %'
               OR titulo LIKE '%Conferencia Tech %'
               OR titulo LIKE '%Evento Base%'
               OR titulo LIKE '%Taller Limitado%'
               OR titulo LIKE '%Hackathon Amplio%'
               OR titulo LIKE '%Conferencia Capacidad%'
               OR titulo LIKE '%IA Summit%'
               OR titulo LIKE '%Evento Org Test%'
               OR titulo LIKE '%Evento Asistio Directo Test%'
               OR titulo LIKE '%Conferencia Anual MEH 179%'
               OR (creado_por IN :seed_user_ids AND :has_users)
        """)
        seed_events = db.execute(sql_find_seed_events, {
            "seed_titles": tuple(SEED_EVENT_TITLES),
            "seed_user_ids": tuple(seed_user_ids or [-1]),
            "has_users": bool(seed_user_ids)
        }).fetchall()
        seed_event_ids = [row[0] for row in seed_events]
        logger.info(f"📅 Eventos semilla/test detectados para eliminación: {len(seed_event_ids)}")

        # 3. Identificar cursos semilla
        sql_find_seed_courses = text("""
            SELECT id_curso, nombre_curso FROM cursos
            WHERE nombre_curso IN :seed_courses
               OR nombre_curso LIKE '%Test%'
               OR nombre_curso LIKE '%Demo%'
               OR (creado_por IN :seed_user_ids AND :has_users)
        """)
        seed_courses = db.execute(sql_find_seed_courses, {
            "seed_courses": tuple(SEED_COURSE_NAMES),
            "seed_user_ids": tuple(seed_user_ids or [-1]),
            "has_users": bool(seed_user_ids)
        }).fetchall()
        seed_course_ids = [row[0] for row in seed_courses]
        logger.info(f"🎓 Cursos semilla detectados para eliminación: {len(seed_course_ids)}")

        # -------------------------------------------------------------
        # 4. ELIMINACIÓN EN CASCADA CONTROLADA (Hijos -> Padres)
        # -------------------------------------------------------------

        # A) Asistencia y Checkpoints de Eventos
        if seed_event_ids or seed_user_ids:
            db.execute(text("""
                DELETE FROM asistencia_detalles
                WHERE (id_inscripcion IN (
                    SELECT id_inscripcion FROM inscripciones_eventos 
                    WHERE id_evento IN :event_ids OR id_usuario IN :user_ids
                ) AND (:has_events OR :has_users))
                OR (escaneado_por IN :user_ids AND :has_users)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "event_ids": tuple(seed_event_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_events": bool(seed_event_ids)
            })
            db.commit()

            db.execute(text("""
                DELETE FROM checkpoint_permisos
                WHERE (id_usuario IN :user_ids AND :has_users)
                   OR (id_checkpoint IN (
                       SELECT id_checkpoint FROM checkpoints WHERE id_evento IN :event_ids
                   ) AND :has_events)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "event_ids": tuple(seed_event_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_events": bool(seed_event_ids)
            })
            db.commit()

            if seed_event_ids:
                db.execute(text("DELETE FROM checkpoints WHERE id_evento IN :event_ids"), {
                    "event_ids": tuple(seed_event_ids)
                })
                db.execute(text("DELETE FROM eventos_pagos_qr WHERE id_evento IN :event_ids"), {
                    "event_ids": tuple(seed_event_ids)
                })
                db.execute(text("DELETE FROM eventos_speakers WHERE id_evento IN :event_ids"), {
                    "event_ids": tuple(seed_event_ids)
                })
                db.execute(text("DELETE FROM eventos_auspiciadores WHERE id_evento IN :event_ids"), {
                    "event_ids": tuple(seed_event_ids)
                })
                db.execute(text("DELETE FROM eventos_comunidades WHERE id_evento IN :event_ids"), {
                    "event_ids": tuple(seed_event_ids)
                })
                db.commit()

        # B) Anuncios y Recursos de Eventos/Cursos/Usuarios semilla
        if seed_event_ids or seed_course_ids or seed_user_ids:
            db.execute(text("""
                DELETE FROM anuncios
                WHERE (id_autor IN :user_ids AND :has_users)
                   OR (id_evento IN :event_ids AND :has_events)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "event_ids": tuple(seed_event_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_events": bool(seed_event_ids)
            })
            db.commit()

            db.execute(text("""
                DELETE FROM recursos
                WHERE (creado_por IN :user_ids AND :has_users)
                   OR (id_evento IN :event_ids AND :has_events)
                   OR (id_curso IN :course_ids AND :has_courses)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "event_ids": tuple(seed_event_ids or [-1]),
                "course_ids": tuple(seed_course_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_events": bool(seed_event_ids),
                "has_courses": bool(seed_course_ids)
            })
            db.commit()

        # C) Inscripciones de Eventos
        if seed_event_ids or seed_user_ids:
            db.execute(text("""
                DELETE FROM inscripciones_eventos
                WHERE (id_usuario IN :user_ids AND :has_users)
                   OR (id_evento IN :event_ids AND :has_events)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "event_ids": tuple(seed_event_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_events": bool(seed_event_ids)
            })
            db.commit()

        # D) Cursos: Tareas, Entregas, Lecciones, Foros, Inscripciones
        if seed_course_ids or seed_user_ids:
            db.execute(text("""
                DELETE FROM entregas_tareas
                WHERE (id_usuario IN :user_ids AND :has_users)
                   OR (id_tarea IN (
                       SELECT t.id_tarea FROM tareas t
                       JOIN lecciones l ON t.id_leccion = l.id_leccion
                       WHERE l.id_curso IN :course_ids
                   ) AND :has_courses)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "course_ids": tuple(seed_course_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_courses": bool(seed_course_ids)
            })
            db.commit()

            db.execute(text("""
                DELETE FROM posts_foro
                WHERE (id_usuario IN :user_ids AND :has_users)
                   OR (id_curso IN :course_ids AND :has_courses)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "course_ids": tuple(seed_course_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_courses": bool(seed_course_ids)
            })
            db.commit()

            db.execute(text("""
                DELETE FROM inscripciones_cursos
                WHERE (id_usuario IN :user_ids AND :has_users)
                   OR (id_curso IN :course_ids AND :has_courses)
            """), {
                "user_ids": tuple(seed_user_ids or [-1]),
                "course_ids": tuple(seed_course_ids or [-1]),
                "has_users": bool(seed_user_ids),
                "has_courses": bool(seed_course_ids)
            })
            db.commit()

            if seed_course_ids:
                db.execute(text("""
                    DELETE FROM tareas WHERE id_leccion IN (
                        SELECT id_leccion FROM lecciones WHERE id_curso IN :course_ids
                    )
                """), {"course_ids": tuple(seed_course_ids)})
                db.execute(text("DELETE FROM lecciones WHERE id_curso IN :course_ids"), {
                    "course_ids": tuple(seed_course_ids)
                })
                db.commit()

        # E) Pedidos, Detalles y Pagos de Usuarios Semilla
        if seed_user_ids:
            db.execute(text("""
                DELETE FROM pedido_detalles
                WHERE id_pedido IN (
                    SELECT id_pedido FROM pedidos WHERE id_usuario IN :user_ids
                )
            """), {"user_ids": tuple(seed_user_ids)})
            db.commit()

            # Desvincular pagos en pedidos de semilla
            db.execute(text("""
                UPDATE pedidos SET id_pago = NULL WHERE id_usuario IN :user_ids
            """), {"user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("DELETE FROM pedidos WHERE id_usuario IN :user_ids"), {
                "user_ids": tuple(seed_user_ids)
            })
            db.commit()

            db.execute(text("""
                DELETE FROM pagos 
                WHERE id_usuario IN :user_ids 
                   OR creado_por IN :user_ids
            """), {"user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("DELETE FROM usuarios_badges WHERE id_usuario IN :user_ids"), {
                "user_ids": tuple(seed_user_ids)
            })
            db.commit()

            db.execute(text("DELETE FROM certificados WHERE id_usuario IN :user_ids"), {
                "user_ids": tuple(seed_user_ids)
            })
            db.commit()

            db.execute(text("DELETE FROM logs_sistema WHERE id_admin IN :user_ids"), {
                "user_ids": tuple(seed_user_ids)
            })
            db.commit()

        # F) Borrar Eventos Semilla Definitivamente
        if seed_event_ids:
            db.execute(text("DELETE FROM eventos WHERE id_evento IN :event_ids"), {
                "event_ids": tuple(seed_event_ids)
            })
            db.commit()
            logger.info(f"✅ Se eliminaron {len(seed_event_ids)} eventos semilla/test.")

        # G) Borrar Cursos Semilla Definitivamente
        if seed_course_ids:
            db.execute(text("DELETE FROM cursos WHERE id_curso IN :course_ids"), {
                "course_ids": tuple(seed_course_ids)
            })
            db.commit()
            logger.info(f"✅ Se eliminaron {len(seed_course_ids)} cursos semilla/test.")

        # H) Borrar Speakers, Auspiciadores y Comunidades Semilla
        db.execute(text("""
            DELETE FROM speakers 
            WHERE nombre LIKE 'Expert %' 
               OR bio = 'Experto internacional en tecnología avanzada.'
        """))
        db.execute(text("""
            DELETE FROM auspiciadores 
            WHERE nombre LIKE 'Tech Sponsor %'
        """))
        db.execute(text("""
            DELETE FROM comunidades_aliadas 
            WHERE nombre LIKE 'Comunidad Dev %'
        """))
        db.commit()

        # I) Desvincular llaves foráneas restantes antes de borrar usuarios semilla
        if seed_user_ids:
            logger.info("🔗 Desvinculando referencias residuales a cuentas semilla...")
            db.execute(text("""
                UPDATE configuracion_global 
                SET creado_por = :nataly_id, modificado_por = NULL 
                WHERE creado_por IN :user_ids OR modificado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE cursos 
                SET id_instructor = :nataly_id, creado_por = :nataly_id 
                WHERE id_instructor IN :user_ids OR creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE eventos 
                SET id_organizador = :nataly_id, creado_por = :nataly_id 
                WHERE id_organizador IN :user_ids OR creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE pagos 
                SET validado_por = NULL, reembolsado_por = NULL 
                WHERE validado_por IN :user_ids OR reembolsado_por IN :user_ids
            """), {"user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE recursos 
                SET creado_por = :nataly_id 
                WHERE creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE anuncios 
                SET id_autor = :nataly_id, creado_por = :nataly_id 
                WHERE id_autor IN :user_ids OR creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE productos 
                SET creado_por = :nataly_id 
                WHERE creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE badges 
                SET creado_por = :nataly_id 
                WHERE creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            db.execute(text("""
                UPDATE usuarios 
                SET creado_por = :nataly_id 
                WHERE creado_por IN :user_ids
            """), {"nataly_id": nataly_id, "user_ids": tuple(seed_user_ids)})
            db.commit()

            # J) Borrar Usuarios Semilla Definitivamente
            db.execute(text("DELETE FROM usuarios WHERE id_usuario IN :user_ids"), {
                "user_ids": tuple(seed_user_ids)
            })
            db.commit()
            logger.info(f"✅ Se eliminaron {len(seed_user_ids)} cuentas de usuario semilla y de prueba.")

        # K) Asegurar que la administradora Nataly Gemio y admin@meh.com permanezcan activos e intactos
        if nataly:
            nataly.rol = 'ADMIN'
            nataly.activo = True
            nataly.id_estado = 2
            nataly.es_nuevo = False
            db.commit()

        admin_user = db.query(models.Usuario).filter(models.Usuario.correo == 'admin@meh.com').first()
        if admin_user:
            admin_user.rol = 'ADMIN'
            admin_user.activo = True
            admin_user.id_estado = 2
            admin_user.es_nuevo = False
            db.commit()

        remaining = db.query(models.Usuario).all()
        logger.info("======================================================")
        logger.info(f"🎉 LIMPIEZA COMPLETADA CON ÉXITO. USUARIOS REALES ACTIVOS EN BD: {len(remaining)}")
        for u in remaining:
            logger.info(f"   👤 [REAL] ID {u.id_usuario} | {u.nombres} {u.apellidos} ({u.correo}) - Rol: {u.rol}")
        logger.info("======================================================")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error durante la limpieza de datos semilla: {e}", exc_info=True)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()
