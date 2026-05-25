import sys
import os
from datetime import datetime, timedelta
import uuid
import random
from sqlalchemy.orm import Session

# Añadir el path para que reconozca el módulo app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal, engine
from app.models import models
from app.core import auth as auth_core

# --- DATOS PARA GENERACIÓN ---
NOMBRES = ["Carlos", "Ana", "Roberto", "Lucia", "Fernando", "Maria", "Jorge", "Elena", "Miguel", "Sofia", "David", "Beatriz", "Ricardo", "Carmen", "Andrés", "Valeria", "Gonzalo", "Isabel", "Tomas", "Paola"]
APELLIDOS = ["Perez", "García", "Rodríguez", "López", "Sánchez", "Martínez", "González", "Gómez", "Fernández", "Díaz", "Vargas", "Mendoza", "Castillo", "Villanueva", "Rojas", "Mamani", "Quispe", "Condori", "Flores", "Guzmán"]
INSTITUCIONES = ["UMSA", "UCB", "UPB", "EMI", "UNIVALLE", "Freelance", "Microsoft", "Google", "Local Business", "Gobierno Digital"]
CIUDADES = ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Tarija", "Sucre", "Beni", "Pando"]

TEMAS_EVENTOS = [
    ("Cloud Computing Summit", "CONFERENCIA", "Explorando AWS, Azure y Google Cloud."),
    ("Taller de Python para Data Science", "TALLER", "Aprende pandas, numpy y scikit-learn."),
    ("Networking Tech La Paz", "NETWORKING", "Conecta con los líderes de la industria."),
    ("Hackathon MEH 2026", "HACKATHON", "48 horas de código puro y pizza."),
    ("Seminario de Ciberseguridad", "CONFERENCIA", "Protegiendo infraestructuras críticas.")
]

CURSOS_DATA = [
    ("Fullstack React & FastAPI", "Domina el desarrollo moderno.", 60, False),
    ("Azure Administrator (AZ-104)", "Prepárate para la certificación oficial.", 40, True),
    ("Introducción a Rust", "El lenguaje más amado por los devs.", 30, False)
]

PRODUCTOS = [
    ("T-Shirt MEH Original", "Algodón 100% con logo bordado.", 120.00, 50, "ROPA"),
    ("Sticker Pack (5 unidades)", "Vinilo de alta calidad para tu laptop.", 15.00, 200, "ACCESORIOS"),
    ("Mug Térmico 'Code & Coffee'", "Mantiene tu café caliente por 6 horas.", 85.00, 30, "ACCESORIOS"),
    ("Hoodie 'Dark Mode'", "Sudadera premium negra con capucha.", 250.00, 25, "ROPA"),
    ("Gorra MEH Tech", "Estilo minimalista para el sol paceño.", 60.00, 40, "ROPA"),
    ("Kit VIP Evento", "Entrada, bolso, camiseta y stickers.", 350.00, 15, "KIT")
]

BADGES_DATA = [
    ("Primer Paso", "Iniciaste sesión por primera vez.", "static/badges/welcome.png", 5),
    ("Asistente Oro", "Asististe a 3 eventos presenciales.", "static/badges/gold_attendee.png", 50),
    ("Ninja de Python", "Completaste el curso de Python.", "static/badges/python_ninja.png", 30),
    ("Donante MEH", "Realizaste tu primera compra en la tienda.", "static/badges/donor.png", 20),
    ("Embajador Local", "Ayudaste en la organización de un evento.", "static/badges/ambassador.png", 100)
]

def generate_super_seed():
    db = SessionLocal()
    print("🌟 INICIANDO SUPER SEMILLA - PLATAFORMA MEH 🌟")
    
    try:
        # 0. Limpiar tablas (Opcional - Comentado para seguridad)
        # db.query(models.LogSistema).delete()
        # db.query(models.InscripcionEvento).delete()
        # ... etc
        
        password_hash = auth_core.get_password_hash("password123")

        # 1. USUARIOS STAFF
        print("👥 Creando Staff...")
        staff_roles = ["ADMIN", "ORGANIZADOR", "SOPORTE", "MODERADOR", "EMBAJADOR"]
        staff_users = []
        for role in staff_roles:
            email = f"{role.lower()}@meh.com"
            user = db.query(models.Usuario).filter(models.Usuario.correo == email).first()
            if not user:
                user = models.Usuario(
                    nombres=role.capitalize(),
                    apellidos="Oficial",
                    correo=email,
                    password_hash=password_hash,
                    rol=role,
                    alias=f"{role}_MEH",
                    institucion="MEH Core Team",
                    tipo_entidad="Profesional",
                    preferencia_tema="dark",
                    es_nuevo=False
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            staff_users.append(user)
        
        admin_id = staff_users[0].id_usuario

        # 2. USUARIOS MIEMBROS (20 personas)
        print("👥 Creando 20 Miembros...")
        miembros = []
        for i in range(20):
            email = f"user{i}@test.com"
            user = db.query(models.Usuario).filter(models.Usuario.correo == email).first()
            if not user:
                user = models.Usuario(
                    nombres=random.choice(NOMBRES),
                    apellidos=random.choice(APELLIDOS),
                    correo=email,
                    password_hash=password_hash,
                    rol="MIEMBRO",
                    alias=f"dev_{i}",
                    institucion=random.choice(INSTITUCIONES),
                    departamento=random.choice(CIUDADES),
                    tipo_entidad=random.choice(["Estudiante", "Profesional"]),
                    bio=f"Soy un desarrollador apasionado por la tecnología número {i}.",
                    fecha_registro=datetime.utcnow() - timedelta(days=random.randint(1, 100)),
                    es_nuevo=False
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            miembros.append(user)

        # 3. SPEAKERS, AUSPICIADORES Y COMUNIDADES
        print("📢 Creando Aliados...")
        speakers = []
        for i in range(5):
            spk = models.Speaker(
                nombre=f"Expert {random.choice(NOMBRES)} {random.choice(APELLIDOS)}",
                bio="Experto internacional en tecnología avanzada.",
                trayectoria="10+ años en el sector.",
                trabajo_actual=random.choice(["Google", "Microsoft", "Netflix", "OpenAI"]),
                linkedin_url="https://linkedin.com/in/expert",
                creado_por=admin_id
            )
            db.add(spk)
            speakers.append(spk)

        auspiciadores = []
        for i in range(5):
            ausp = models.Auspiciador(
                nombre=f"Tech Sponsor {i}",
                tipo=random.choice(["GOLD", "SILVER", "PLATINUM"]),
                sitio_web="https://sponsor.com",
                creado_por=admin_id
            )
            db.add(ausp)
            auspiciadores.append(ausp)

        comunidades = []
        for i in range(3):
            com = models.ComunidadAliada(
                nombre=f"Comunidad Dev {i}",
                descripcion="Grupo local de desarrolladores.",
                link_contacto="https://facebook.com/devgroup",
                creado_por=admin_id
            )
            db.add(com)
            comunidades.append(com)
        db.commit()

        # 4. EVENTOS (Pasados y Futuros)
        print("📅 Creando Eventos...")
        eventos = []
        for i, (titulo, tipo, desc) in enumerate(TEMAS_EVENTOS):
            # i=0,1 (pasados), i=2 (hoy), i=3,4 (futuros)
            offset = (i - 2) * 10 
            fecha = datetime.utcnow() + timedelta(days=offset)
            
            ev = models.Evento(
                titulo=titulo,
                tipo_evento=tipo,
                descripcion=desc,
                fecha_inicio=fecha,
                fecha_fin=fecha + timedelta(hours=4),
                modalidad=random.choice(["PRESENCIAL", "VIRTUAL", "HIBRIDO"]),
                ubicacion="Centro de Convenciones MEH" if i != 1 else "Online",
                capacidad_max=50 + (i * 10),
                estado="FINALIZADO" if offset < 0 else ("EN_CURSO" if offset == 0 else "PROGRAMADO"),
                id_organizador=staff_users[1].id_usuario,
                creado_por=admin_id
            )
            # Asignar relaciones aleatorias
            ev.speakers = random.sample(speakers, 2)
            ev.auspiciadores = random.sample(auspiciadores, 2)
            ev.comunidades = random.sample(comunidades, 1)
            
            db.add(ev)
            eventos.append(ev)
        db.commit()

        # 5. CURSOS, LECCIONES Y TAREAS
        print("🎓 Creando Academia...")
        cursos = []
        for titulo, desc, horas, is_ms in CURSOS_DATA:
            curso = models.Curso(
                nombre_curso=titulo,
                descripcion=desc,
                horas_academicas=horas,
                es_ms_learning=is_ms,
                estado="ACTIVO",
                id_instructor=staff_users[1].id_usuario,
                creado_por=admin_id
            )
            db.add(curso)
            db.commit()
            db.refresh(curso)
            
            # Lecciones
            for l in range(1, 6):
                leccion = models.Leccion(
                    id_curso=curso.id_curso,
                    titulo=f"Módulo {l}: Introducción avanzada",
                    contenido_texto="En esta lección aprenderemos los conceptos fundamentales...",
                    orden=l,
                    creado_por=admin_id
                )
                db.add(leccion)
                db.commit()
                db.refresh(leccion)
                
                # Una tarea por cada 2 lecciones
                if l % 2 == 0:
                    tarea = models.Tarea(
                        id_leccion=leccion.id_leccion,
                        titulo=f"Práctica de Módulo {l}",
                        instrucciones="Desarrolle el ejercicio propuesto y suba su archivo.",
                        puntos_max=100,
                        creado_por=admin_id
                    )
                    db.add(tarea)
            cursos.append(curso)
        db.commit()

        # 6. PRODUCTOS
        print("🛍️ Creando Tienda...")
        for nombre, desc, precio, stock, cat in PRODUCTOS:
            prod = models.Producto(
                nombre=nombre,
                descripcion=desc,
                precio=precio,
                stock=stock,
                categoria=cat,
                creado_por=admin_id
            )
            db.add(prod)
        db.commit()

        # 7. INSCRIPCIONES Y PAGOS (Simular actividad)
        print("💳 Simulando Actividad Económica...")
        for m in miembros:
            # Inscribir a 2 eventos aleatorios
            target_evs = random.sample(eventos, 2)
            for ev in target_evs:
                ins = models.InscripcionEvento(
                    id_usuario=m.id_usuario,
                    id_evento=ev.id_evento,
                    estado_inscripcion="CONFIRMADA" if ev.estado == "FINALIZADO" else "PENDIENTE",
                    codigo_qr=str(uuid.uuid4()),
                    asistio=True if ev.estado == "FINALIZADO" else False,
                    fecha_validacion=datetime.utcnow() if ev.estado == "FINALIZADO" else None,
                    creado_por=m.id_usuario
                )
                db.add(ins)
                db.commit()
                
                # Crear pago para inscripciones confirmadas
                if ins.estado_inscripcion == "CONFIRMADA":
                    pago = models.Pago(
                        id_usuario=m.id_usuario,
                        monto=50.00,
                        metodo_pago="TRANSFERENCIA",
                        estado_pago="COMPLETADO",
                        id_referencia=ev.id_evento,
                        tipo_referencia="EVENTO",
                        validado_por=staff_users[2].id_usuario,
                        fecha_validacion=datetime.utcnow(),
                        creado_por=m.id_usuario
                    )
                    db.add(pago)
                    db.commit()
                    ins.id_pago = pago.id_pago
                    db.commit()

            # Inscribir a 1 curso
            c = random.choice(cursos)
            insc_c = models.InscripcionCurso(
                id_usuario=m.id_usuario,
                id_curso=c.id_curso,
                progreso=random.randint(0, 100),
                estado_inscripcion="CONFIRMADA",
                finalizado=True if random.random() > 0.7 else False,
                creado_por=m.id_usuario
            )
            db.add(insc_c)
            db.commit()

        # 8. GAMIFICACIÓN (Badges)
        print("🏆 Distribuyendo Insignias...")
        badges = []
        for n, d, img, p in BADGES_DATA:
            badge = models.Badge(
                nombre_badge=n,
                descripcion=d,
                imagen_url=img,
                puntos=p,
                creado_por=admin_id
            )
            db.add(badge)
            db.commit()
            db.refresh(badge)
            badges.append(badge)

        for m in miembros:
            # Todos tienen el de primer paso
            db.add(models.UsuarioBadge(id_usuario=m.id_usuario, id_badge=badges[0].id_badge))
            # Algunos tienen más
            if random.random() > 0.5:
                db.add(models.UsuarioBadge(id_usuario=m.id_usuario, id_badge=random.choice(badges[1:]).id_badge))
        db.commit()

        # 9. ANUNCIOS Y CONFIG
        print("📢 Publicando Anuncios...")
        anuncio = models.Anuncio(
            titulo="Bienvenidos a la nueva Plataforma MEH 2026",
            contenido="Hemos actualizado todos nuestros sistemas para brindarte la mejor experiencia tecnológica de Bolivia.",
            tipo="SUCCESS",
            id_autor=admin_id,
            creado_por=admin_id
        )
        db.add(anuncio)
        
        # Configuración Global
        configs = [
            ("WHATSAPP_CONTACTO", "+591 70000000", "Número oficial de soporte"),
            ("LINKEDIN_PAGE", "https://linkedin.com/company/meh-bolivia", "Página oficial"),
            ("MAX_FILE_SIZE_MB", "10", "Límite de subida de archivos")
        ]
        for c, v, d in configs:
            conf = models.ConfiguracionGlobal(clave=c, valor=v, descripcion=d, creado_por=admin_id)
            db.add(conf)
        db.commit()

        print("\n✅ SUPER SEMILLA COMPLETADA EXITOSAMENTE!")
        print(f"📈 Resumen:")
        print(f" - {len(miembros)} Miembros creados.")
        print(f" - {len(eventos)} Eventos generados.")
        print(f" - {len(cursos)} Cursos con lecciones.")
        print(f" - {len(badges)} Badges distribuidos.")
        print(f" - Tienda poblada con productos.")
        print("\n🚀 El sistema está listo para pruebas de alta carga y visualización.")

    except Exception as e:
        print(f"❌ ERROR CRÍTICO: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_super_seed()
