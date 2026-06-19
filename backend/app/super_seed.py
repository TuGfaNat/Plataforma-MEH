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
    ("Seminario de Ciberseguridad", "CONFERENCIA", "Protegiendo infraestructuras críticas."),
    ("Azure DevOps Bootcamp", "TALLER", "Integración continua y entrega continua con Azure Pipelines."),
    ("Introducción a la Inteligencia Artificial", "CONFERENCIA", "Modelos de lenguaje grande y redes neuronales."),
    ("Desarrollo de Mobile Apps con MAUI", "TALLER", "Creando aplicaciones multiplataforma con C# y .NET MAUI."),
    ("Microsoft Student Ambassadors Meetup", "NETWORKING", "Comparte experiencias con embajadores de todo el país."),
    ("Workshop de PowerBI Avanzado", "TALLER", "Visualización de datos y modelado DAX profesional."),
    ("Imagine Cup Bolivia 2026 - Mentoría", "ASESORAMIENTO", "Sesión de retroalimentación para equipos competidores.")
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
    print("[START] INICIANDO SUPER SEMILLA - PLATAFORMA MEH")
    
    try:
        password_hash = auth_core.get_password_hash("password123")

        # 1. USUARIOS STAFF
        print("[INFO] Creando Staff...")
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

        # 1.1. REGISTRAR A NATALY GEMIO (ADMIN PRINCIPAL DE LA CREADORA)
        nataly_email = "natalygemio@gmail.com"
        nataly_user = db.query(models.Usuario).filter(models.Usuario.correo == nataly_email).first()
        if not nataly_user:
            nataly_user = models.Usuario(
                nombres="Nataly",
                apellidos="Gemio",
                correo=nataly_email,
                password_hash=password_hash,
                rol="ADMIN",
                alias="Nataly_Gemio",
                institucion="Plataforma MEH",
                bio="Líder y visionaria de la Plataforma MEH. Impulsando la tecnología en Bolivia.",
                tipo_entidad="Profesional",
                preferencia_tema="dark",
                fecha_registro=datetime.utcnow(),
                es_nuevo=False
            )
            db.add(nataly_user)
            db.commit()
            db.refresh(nataly_user)
            print("[SUCCESS] ¡Bienvenida Nataly! Usuario natalygemio@gmail.com creado como ADMIN.")
        else:
            print("[INFO] El usuario natalygemio@gmail.com ya existe.")

        # 2. USUARIOS MIEMBROS (20 personas)
        print("[INFO] Creando 20 Miembros...")
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
        print("[INFO] Creando Aliados...")
        speakers = []
        for i in range(5):
            name = f"Expert {random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            spk = db.query(models.Speaker).filter(models.Speaker.nombre == name).first()
            if not spk:
                spk = models.Speaker(
                    nombre=name,
                    bio="Experto internacional en tecnología avanzada.",
                    trayectoria="10+ años en el sector.",
                    trabajo_actual=random.choice(["Google", "Microsoft", "Netflix", "OpenAI"]),
                    linkedin_url="https://linkedin.com/in/expert",
                    creado_por=admin_id
                )
                db.add(spk)
                db.commit()
                db.refresh(spk)
            speakers.append(spk)

        auspiciadores = []
        for i in range(5):
            name = f"Tech Sponsor {i}"
            ausp = db.query(models.Auspiciador).filter(models.Auspiciador.nombre == name).first()
            if not ausp:
                ausp = models.Auspiciador(
                    nombre=name,
                    tipo=random.choice(["GOLD", "SILVER", "PLATINUM"]),
                    sitio_web="https://sponsor.com",
                    creado_por=admin_id
                )
                db.add(ausp)
                db.commit()
                db.refresh(ausp)
            auspiciadores.append(ausp)

        comunidades = []
        for i in range(3):
            name = f"Comunidad Dev {i}"
            com = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.nombre == name).first()
            if not com:
                com = models.ComunidadAliada(
                    nombre=name,
                    descripcion="Grupo local de desarrolladores.",
                    link_contacto="https://facebook.com/devgroup",
                    creado_por=admin_id
                )
                db.add(com)
                db.commit()
                db.refresh(com)
            comunidades.append(com)

        # 4. EVENTOS (Pasados y Futuros)
        print("[INFO] Creando Eventos...")
        eventos = []
        for i, (titulo, tipo, desc) in enumerate(TEMAS_EVENTOS):
            ev = db.query(models.Evento).filter(models.Evento.titulo == titulo).first()
            if not ev:
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
                ev.speakers = random.sample(speakers, 2)
                ev.auspiciadores = random.sample(auspiciadores, 2)
                ev.comunidades = random.sample(comunidades, 1)
                
                db.add(ev)
                db.commit()
                db.refresh(ev)
            eventos.append(ev)

        # 5. CURSOS, LECCIONES Y TAREAS
        print("[INFO] Creando Academia...")
        cursos = []
        for titulo, desc, horas, is_ms in CURSOS_DATA:
            curso = db.query(models.Curso).filter(models.Curso.nombre_curso == titulo).first()
            if not curso:
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
                        db.commit()
            cursos.append(curso)

        # 6. PRODUCTOS
        print("[INFO] Creando Tienda...")
        for nombre, desc, precio, stock, cat in PRODUCTOS:
            prod = db.query(models.Producto).filter(models.Producto.nombre == nombre).first()
            if not prod:
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
        print("[INFO] Simulando Actividad Económica...")
        for m in miembros:
            # Registrar inscripciones si no existen
            target_evs = random.sample(eventos, 2)
            for ev in target_evs:
                ins = db.query(models.InscripcionEvento).filter(
                    models.InscripcionEvento.id_usuario == m.id_usuario,
                    models.InscripcionEvento.id_evento == ev.id_evento
                ).first()
                
                if not ins:
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
                    db.refresh(ins)
                    
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
                        db.refresh(pago)
                        ins.id_pago = pago.id_pago
                        db.commit()

            # Inscribir a 1 curso
            c = random.choice(cursos)
            insc_c = db.query(models.InscripcionCurso).filter(
                models.InscripcionCurso.id_usuario == m.id_usuario,
                models.InscripcionCurso.id_curso == c.id_curso
            ).first()
            if not insc_c:
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
        print("[INFO] Distribuyendo Insignias...")
        badges = []
        for n, d, img, p in BADGES_DATA:
            badge = db.query(models.Badge).filter(models.Badge.nombre_badge == n).first()
            if not badge:
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
            ub = db.query(models.UsuarioBadge).filter(
                models.UsuarioBadge.id_usuario == m.id_usuario,
                models.UsuarioBadge.id_badge == badges[0].id_badge
            ).first()
            if not ub:
                db.add(models.UsuarioBadge(id_usuario=m.id_usuario, id_badge=badges[0].id_badge))
            
            # Algunos tienen más
            if random.random() > 0.5:
                random_badge = random.choice(badges[1:])
                ub_extra = db.query(models.UsuarioBadge).filter(
                    models.UsuarioBadge.id_usuario == m.id_usuario,
                    models.UsuarioBadge.id_badge == random_badge.id_badge
                ).first()
                if not ub_extra:
                    db.add(models.UsuarioBadge(id_usuario=m.id_usuario, id_badge=random_badge.id_badge))
        db.commit()

        # 9. ANUNCIOS Y CONFIG
        print("[INFO] Publicando Anuncios...")
        anuncios_data = [
            {
                "titulo": "Bienvenidos a la nueva Plataforma MEH 2026",
                "contenido": "Hemos actualizado todos nuestros sistemas para brindarte la mejor experiencia tecnológica de Bolivia. Disfruta de la nueva interfaz optimizada con Fluent UI y nuestro nuevo Learning Hub.",
                "tipo": "SUCCESS"
            },
            {
                "titulo": "Convocatoria Abierta: Microsoft Learn Student Ambassadors 2026",
                "contenido": "Si quieres liderar la comunidad tecnológica en nuestra facultad y acceder a beneficios exclusivos como suscripciones a Azure, licencias de desarrollo de Visual Studio Enterprise, y mentorías directas con profesionales de Microsoft, ¡postula hoy mismo en el validador de talento!",
                "tipo": "INFO"
            },
            {
                "titulo": "Inicio de Clases en el Learning Hub (LMS)",
                "contenido": "Estimada comunidad, les informamos que el día lunes de la siguiente semana iniciamos oficialmente las clases del curso 'Fullstack React & FastAPI'. Asegúrate de estar matriculado y revisar la barra de navegación del curso.",
                "tipo": "EVENTO"
            },
            {
                "titulo": "Hackathon MEH 2026 - ¡Quedan pocos cupos!",
                "contenido": "¡Alerta de últimos cupos! El registro para la Hackathon MEH 2026 de este fin de semana está a punto de cerrarse debido al límite de capacidad del auditorio. Regístrate de inmediato para no quedar fuera.",
                "tipo": "ALERTA"
            }
        ]
        for a_data in anuncios_data:
            anuncio = db.query(models.Anuncio).filter(models.Anuncio.titulo == a_data["titulo"]).first()
            if not anuncio:
                anuncio = models.Anuncio(
                    titulo=a_data["titulo"],
                    contenido=a_data["contenido"],
                    tipo=a_data["tipo"],
                    activo=True,
                    id_autor=admin_id,
                    creado_por=admin_id
                )
                db.add(anuncio)
            else:
                anuncio.contenido = a_data["contenido"]
                anuncio.tipo = a_data["tipo"]
                anuncio.activo = True
        db.commit()
        
        # Configuración Global
        configs = [
            ("WHATSAPP_CONTACTO", "+591 70000000", "Número oficial de soporte"),
            ("LINKEDIN_PAGE", "https://linkedin.com/company/meh-bolivia", "Página oficial"),
            ("MAX_FILE_SIZE_MB", "10", "Límite de subida de archivos")
        ]
        for c, v, d in configs:
            conf = db.query(models.ConfiguracionGlobal).filter(models.ConfiguracionGlobal.clave == c).first()
            if not conf:
                conf = models.ConfiguracionGlobal(clave=c, valor=v, descripcion=d, creado_por=admin_id)
                db.add(conf)
        db.commit()

        print("\n[SUCCESS] SUPER SEMILLA COMPLETADA EXITOSAMENTE!")
        print("--------------------------------------------------")
        print("[INFO] TODAS LAS CONTRASEÑAS SON: password123")
        print("1. ADMIN CORE: admin@meh.com")
        print(f"2. TU USUARIO ADMIN: {nataly_email} (Nataly Gemio)")
        print("3. ORGANIZADOR: organizador@meh.com")
        print("4. SOPORTE: soporte@meh.com")
        print("--------------------------------------------------")
        print("[INFO] Resumen:")
        print(f" - {len(miembros)} Miembros creados.")
        print(f" - {len(eventos)} Eventos generados.")
        print(f" - {len(cursos)} Cursos con lecciones.")
        print(f" - {len(badges)} Badges distribuidos.")
        print(f" - Tienda poblada con productos.")
        print("\n[INFO] El sistema está listo para pruebas de alta carga y visualización.")

    except Exception as e:
        print(f"[ERROR] ERROR CRÍTICO: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_super_seed()
