import json
import re
from datetime import datetime, date
from decimal import Decimal
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy.orm import Session

from ...models import models
from ...schemas import cleanup as cleanup_schema
from ...core.exceptions import ValidacionNegocioError
from .protection import (
    ensure_cleanup_admin,
    get_protected_user_reasons,
    get_superadmin_email,
    is_record_protected,
    PROTECTED_CONFIG_KEYS,
    PRESETS_CONFIG_KEY,
    _get_or_create_config,
)

# Patrones conocidos del seed (super_seed.py)
SEED_EVENT_TITLES = {
    "Cloud Computing Summit",
    "Taller de Python para Data Science",
    "Networking Tech La Paz",
    "Hackathon MEH 2026",
    "Seminario de Ciberseguridad",
    "Azure DevOps Bootcamp",
    "Introducción a la Inteligencia Artificial",
    "Desarrollo de Mobile Apps con MAUI",
    "Microsoft Student Ambassadors Meetup",
    "Workshop de PowerBI Avanzado",
    "Imagine Cup Bolivia 2026 - Mentoría",
}

SEED_COURSE_NAMES = {
    "Fullstack React & FastAPI",
    "Azure Administrator (AZ-104)",
    "Introducción a Rust",
}

SEED_PRODUCT_NAMES = {
    "T-Shirt MEH Original",
    "Sticker Pack (5 unidades)",
    "Mug Térmico 'Code & Coffee'",
    "Hoodie 'Dark Mode'",
    "Gorra MEH Tech",
    "Kit VIP Evento",
}

SEED_BADGE_NAMES = {
    "Primer Paso",
    "Asistente Oro",
    "Ninja de Python",
    "Donante MEH",
    "Embajador Local",
}

SEED_ANNOUNCEMENT_TITLES = {
    "Bienvenidos a la nueva Plataforma MEH 2026",
    "Convocatoria Abierta: Microsoft Learn Student Ambassadors 2026",
    "Inicio de Clases en el Learning Hub (LMS)",
    "Hackathon MEH 2026 - ¡Quedan pocos cupos!",
    "prueba de anuncion",
}

SEED_CONFIG_KEYS = {
    "WHATSAPP_CONTACTO",
    "LINKEDIN_PAGE",
    "MAX_FILE_SIZE_MB",
}

SEED_EMAIL_PATTERNS = (
    re.compile(r"^(admin|organizador|soporte|moderador|embajador)@meh\.com$", re.IGNORECASE),
    re.compile(r"^user\d+@test\.com$", re.IGNORECASE),
    re.compile(r".+_(seed|demo|test).*@", re.IGNORECASE),
)

# Definición completa del catálogo y orden topológico (Hijos -> Padres)
CLEANUP_CATALOG: Dict[str, Dict[str, Any]] = {
    "asistencia_detalles": {
        "model": models.AsistenciaDetalle,
        "label": "Detalles de Asistencia (Escaneos)",
        "group": "eventos_y_logistica",
        "description": "Registros individuales de escaneo QR en checkpoints",
        "pk_field": "id_asistencia",
        "delete_order": 10,
    },
    "checkpoint_permisos": {
        "model": models.CheckpointPermiso,
        "label": "Permisos de Checkpoints",
        "group": "eventos_y_logistica",
        "description": "Asignaciones de staff habilitado para escanear en cada punto",
        "pk_field": "id_permiso",
        "delete_order": 11,
    },
    "eventos_pagos_qr": {
        "model": models.EventoPagoQR,
        "label": "Paquetes QR de Pago por Evento",
        "group": "eventos_y_logistica",
        "description": "Configuración de códigos QR de pago asociados a eventos",
        "pk_field": "id_qr",
        "delete_order": 12,
    },
    "entregas_tareas": {
        "model": models.EntregaTarea,
        "label": "Entregas de Tareas",
        "group": "academia_lms",
        "description": "Envíos y calificaciones de tareas de alumnos en cursos",
        "pk_field": "id_entrega",
        "delete_order": 13,
    },
    "posts_foro": {
        "model": models.PostForo,
        "label": "Mensajes de Foro Académico",
        "group": "academia_lms",
        "description": "Publicaciones y preguntas en los foros de cursos",
        "pk_field": "id_post",
        "delete_order": 14,
    },
    "pedido_detalles": {
        "model": models.PedidoDetalle,
        "label": "Detalles de Pedidos (Ítems)",
        "group": "finanzas_y_tienda",
        "description": "Líneas de detalle de productos comprados en pedidos",
        "pk_field": "id_detalle",
        "delete_order": 15,
    },
    "usuarios_badges": {
        "model": models.UsuarioBadge,
        "label": "Insignias Otorgadas a Usuarios",
        "group": "comunidad_y_sistema",
        "description": "Asignaciones de insignias obtenidas por cada miembro",
        "pk_field": "id_usuario_badge",
        "delete_order": 16,
    },
    "certificados": {
        "model": models.Certificado,
        "label": "Certificados Emitidos",
        "group": "academia_lms",
        "description": "Certificados digitales y físicos de eventos y cursos",
        "pk_field": "id_certificado",
        "delete_order": 17,
    },
    "logs_sistema": {
        "model": models.LogSistema,
        "label": "Logs de Auditoría del Sistema",
        "group": "comunidad_y_sistema",
        "description": "Historial de eventos de auditoría (la limpieza actual siempre genera un nuevo log sobreviviente)",
        "pk_field": "id_log",
        "delete_order": 18,
    },
    "inscripciones_eventos": {
        "model": models.InscripcionEvento,
        "label": "Inscripciones a Eventos",
        "group": "eventos_y_logistica",
        "description": "Registros de participantes inscritos a eventos",
        "pk_field": "id_inscripcion",
        "delete_order": 20,
    },
    "checkpoints": {
        "model": models.Checkpoint,
        "label": "Checkpoints de Acreditación",
        "group": "eventos_y_logistica",
        "description": "Puntos de control de acceso y refrigerio en eventos",
        "pk_field": "id_checkpoint",
        "delete_order": 21,
    },
    "tareas": {
        "model": models.Tarea,
        "label": "Tareas de Lecciones",
        "group": "academia_lms",
        "description": "Actividades evaluables dentro de las lecciones",
        "pk_field": "id_tarea",
        "delete_order": 22,
    },
    "inscripciones_cursos": {
        "model": models.InscripcionCurso,
        "label": "Inscripciones a Cursos",
        "group": "academia_lms",
        "description": "Matrículas y progreso de alumnos en cursos del LMS",
        "pk_field": "id_inscripcion_curso",
        "delete_order": 23,
    },
    "pedidos": {
        "model": models.Pedido,
        "label": "Pedidos de Tienda / POS",
        "group": "finanzas_y_tienda",
        "description": "Órdenes de compra de souvenirs y kits",
        "pk_field": "id_pedido",
        "delete_order": 24,
    },
    "anuncios": {
        "model": models.Anuncio,
        "label": "Anuncios y Comunicados",
        "group": "comunidad_y_sistema",
        "description": "Noticias y avisos segmentados de la plataforma",
        "pk_field": "id_anuncio",
        "delete_order": 25,
    },
    "recursos": {
        "model": models.Recurso,
        "label": "Recursos de Biblioteca VIP",
        "group": "academia_lms",
        "description": "Material descargable y guías técnicas",
        "pk_field": "id_recurso",
        "delete_order": 26,
    },
    "badges": {
        "model": models.Badge,
        "label": "Catálogo de Insignias (Badges)",
        "group": "comunidad_y_sistema",
        "description": "Definiciones de insignias de gamificación",
        "pk_field": "id_badge",
        "delete_order": 27,
    },
    "lecciones": {
        "model": models.Leccion,
        "label": "Lecciones de Cursos",
        "group": "academia_lms",
        "description": "Módulos de contenido de cada curso",
        "pk_field": "id_leccion",
        "delete_order": 30,
    },
    "pagos": {
        "model": models.Pago,
        "label": "Pagos y Comprobantes",
        "group": "finanzas_y_tienda",
        "description": "Transacciones financieras, validaciones y lecturas OCR",
        "pk_field": "id_pago",
        "delete_order": 31,
    },
    "productos": {
        "model": models.Producto,
        "label": "Productos y Souvenirs",
        "group": "finanzas_y_tienda",
        "description": "Catálogo de productos de la tienda MEH",
        "pk_field": "id_producto",
        "delete_order": 32,
    },
    "eventos": {
        "model": models.Evento,
        "label": "Eventos",
        "group": "eventos_y_logistica",
        "description": "Conferencias, talleres, hackathons y meetups",
        "pk_field": "id_evento",
        "delete_order": 33,
    },
    "cursos": {
        "model": models.Curso,
        "label": "Cursos (Programas LMS)",
        "group": "academia_lms",
        "description": "Cursos académicos del Learning Hub",
        "pk_field": "id_curso",
        "delete_order": 34,
    },
    "speakers": {
        "model": models.Speaker,
        "label": "Speakers / Ponentes",
        "group": "comunidad_y_sistema",
        "description": "Directorio de expositores invitados",
        "pk_field": "id_speaker",
        "delete_order": 35,
    },
    "auspiciadores": {
        "model": models.Auspiciador,
        "label": "Auspiciadores / Sponsors",
        "group": "comunidad_y_sistema",
        "description": "Empresas patrocinadoras vinculadas a eventos",
        "pk_field": "id_auspiciador",
        "delete_order": 36,
    },
    "comunidades_aliadas": {
        "model": models.ComunidadAliada,
        "label": "Comunidades Aliadas",
        "group": "comunidad_y_sistema",
        "description": "Comunidades tecnológicas asociadas",
        "pk_field": "id_comunidad",
        "delete_order": 37,
    },
    "configuracion_global": {
        "model": models.ConfiguracionGlobal,
        "label": "Configuración Global",
        "group": "comunidad_y_sistema",
        "description": "Parámetros globales del sistema (las claves de protección están blindadas)",
        "pk_field": "id_config",
        "delete_order": 38,
    },
    "usuarios": {
        "model": models.Usuario,
        "label": "Usuarios y Miembros",
        "group": "usuarios_y_accesos",
        "description": "Cuentas de miembros y personal (Superadmin, usuario actual y lista blanca protegidos)",
        "pk_field": "id_usuario",
        "delete_order": 40,
    },
}

# Matriz explícita de dependencias Padre -> Hijos
# Si nullable=False, el hijo depende estrictamente del padre (bloquea hard-delete si no se incluye, o se incluye en cascada).
# Si nullable=True, es una referencia opcional que se puede desvincular (SET NULL) o incluir en cascada si es dependencia directa.
DEPENDENCY_MATRIX: Dict[str, List[Dict[str, Any]]] = {
    "usuarios": [
        {"child_table": "inscripciones_eventos", "fk_column": "id_usuario", "nullable": False, "description": "Inscripciones del usuario a eventos"},
        {"child_table": "inscripciones_cursos", "fk_column": "id_usuario", "nullable": False, "description": "Matrículas del usuario en cursos"},
        {"child_table": "pagos", "fk_column": "id_usuario", "nullable": False, "description": "Pagos registrados por el usuario"},
        {"child_table": "pedidos", "fk_column": "id_usuario", "nullable": False, "description": "Pedidos realizados por el usuario"},
        {"child_table": "usuarios_badges", "fk_column": "id_usuario", "nullable": False, "description": "Insignias asignadas al usuario"},
        {"child_table": "certificados", "fk_column": "id_usuario", "nullable": False, "description": "Certificados emitidos al usuario"},
        {"child_table": "entregas_tareas", "fk_column": "id_usuario", "nullable": False, "description": "Entregas académicas del usuario"},
        {"child_table": "posts_foro", "fk_column": "id_usuario", "nullable": False, "description": "Publicaciones del usuario en foros"},
        {"child_table": "checkpoint_permisos", "fk_column": "id_usuario", "nullable": False, "description": "Permisos de escaneo del usuario"},
        {"child_table": "asistencia_detalles", "fk_column": "escaneado_por", "nullable": False, "description": "Escaneos realizados por este usuario"},
        {"child_table": "eventos", "fk_column": "id_organizador", "nullable": False, "description": "Eventos donde el usuario figura como organizador"},
        {"child_table": "cursos", "fk_column": "id_instructor", "nullable": True, "description": "Cursos donde el usuario es instructor"},
        {"child_table": "anuncios", "fk_column": "id_autor", "nullable": True, "description": "Anuncios publicados por el usuario"},
        {"child_table": "logs_sistema", "fk_column": "id_admin", "nullable": False, "description": "Logs de auditoría ejecutados por el usuario"},
    ],
    "eventos": [
        {"child_table": "inscripciones_eventos", "fk_column": "id_evento", "nullable": False, "description": "Inscritos en este evento"},
        {"child_table": "checkpoints", "fk_column": "id_evento", "nullable": False, "description": "Checkpoints de acreditación del evento"},
        {"child_table": "eventos_pagos_qr", "fk_column": "id_evento", "nullable": False, "description": "Paquetes QR de pago del evento"},
        {"child_table": "certificados", "fk_column": "id_evento", "nullable": True, "description": "Certificados asociados al evento"},
        {"child_table": "anuncios", "fk_column": "id_evento", "nullable": True, "description": "Anuncios vinculados al evento"},
        {"child_table": "recursos", "fk_column": "id_evento", "nullable": True, "description": "Recursos de biblioteca del evento"},
        {"child_table": "badges", "fk_column": "id_evento_origen", "nullable": True, "description": "Insignias originadas por el evento"},
    ],
    "checkpoints": [
        {"child_table": "asistencia_detalles", "fk_column": "id_checkpoint", "nullable": False, "description": "Escaneos registrados en este checkpoint"},
        {"child_table": "checkpoint_permisos", "fk_column": "id_checkpoint", "nullable": False, "description": "Permisos asignados al checkpoint"},
    ],
    "inscripciones_eventos": [
        {"child_table": "asistencia_detalles", "fk_column": "id_inscripcion", "nullable": False, "description": "Detalles de asistencia de esta inscripción"},
    ],
    "cursos": [
        {"child_table": "lecciones", "fk_column": "id_curso", "nullable": False, "description": "Lecciones pertenecientes al curso"},
        {"child_table": "inscripciones_cursos", "fk_column": "id_curso", "nullable": False, "description": "Alumnos inscritos al curso"},
        {"child_table": "posts_foro", "fk_column": "id_curso", "nullable": False, "description": "Mensajes de foro del curso"},
        {"child_table": "certificados", "fk_column": "id_curso", "nullable": True, "description": "Certificados emitidos por el curso"},
        {"child_table": "recursos", "fk_column": "id_curso", "nullable": True, "description": "Recursos vinculados al curso"},
        {"child_table": "badges", "fk_column": "id_curso_origen", "nullable": True, "description": "Insignias vinculadas al curso"},
    ],
    "lecciones": [
        {"child_table": "tareas", "fk_column": "id_leccion", "nullable": False, "description": "Tareas de la lección"},
    ],
    "tareas": [
        {"child_table": "entregas_tareas", "fk_column": "id_tarea", "nullable": False, "description": "Entregas de alumnos para esta tarea"},
    ],
    "pagos": [
        {"child_table": "inscripciones_eventos", "fk_column": "id_pago", "nullable": True, "description": "Inscripciones a eventos pagadas con este registro"},
        {"child_table": "inscripciones_cursos", "fk_column": "id_pago", "nullable": True, "description": "Inscripciones a cursos pagadas con este registro"},
        {"child_table": "pedidos", "fk_column": "id_pago", "nullable": True, "description": "Pedidos asociados a este pago"},
    ],
    "pedidos": [
        {"child_table": "pedido_detalles", "fk_column": "id_pedido", "nullable": False, "description": "Ítems de detalle del pedido"},
    ],
    "productos": [
        {"child_table": "pedido_detalles", "fk_column": "id_producto", "nullable": False, "description": "Detalles de pedidos que incluyen este producto"},
    ],
    "badges": [
        {"child_table": "usuarios_badges", "fk_column": "id_badge", "nullable": False, "description": "Asignaciones de esta insignia a usuarios"},
    ],
}


def get_ordered_table_keys() -> List[str]:
    """Devuelve las tablas ordenadas por delete_order ascendente (Hijos -> Padres)."""
    return [
        k
        for k, _ in sorted(
            CLEANUP_CATALOG.items(), key=lambda item: item[1]["delete_order"]
        )
    ]


def is_seed_user(user: models.Usuario) -> bool:
    correo = (user.correo or "").strip().lower()
    if correo == get_superadmin_email():
        return False
    for pat in SEED_EMAIL_PATTERNS:
        if pat.match(correo):
            return True
    alias = (user.alias or "").strip()
    if alias.startswith("dev_") or alias.endswith("_MEH"):
        return True
    if (user.institucion or "") == "MEH Core Team" and (user.apellidos or "") == "Oficial":
        return True
    if user.bio and user.bio.startswith("Soy un desarrollador apasionado por la tecnología número"):
        return True
    return False


def build_classification_context(db: Session) -> Dict[str, Any]:
    """Pre-carga mapas ligeros para clasificar origen y resolver padres/creadores sin N+1 queries."""
    users = db.query(models.Usuario).execution_options(include_deleted=True).all()
    eventos = db.query(models.Evento).execution_options(include_deleted=True).all()
    cursos = db.query(models.Curso).execution_options(include_deleted=True).all()
    lecciones = db.query(models.Leccion).execution_options(include_deleted=True).all()
    tareas = db.query(models.Tarea).execution_options(include_deleted=True).all()
    pagos = db.query(models.Pago).execution_options(include_deleted=True).all()
    pedidos = db.query(models.Pedido).execution_options(include_deleted=True).all()
    productos = db.query(models.Producto).execution_options(include_deleted=True).all()
    badges = db.query(models.Badge).execution_options(include_deleted=True).all()
    checkpoints = db.query(models.Checkpoint).execution_options(include_deleted=True).all()
    inscripciones_ev = db.query(models.InscripcionEvento).execution_options(include_deleted=True).all()

    users_map = {u.id_usuario: u for u in users}
    seed_user_ids = {u.id_usuario for u in users if is_seed_user(u)}

    eventos_map = {e.id_evento: e for e in eventos}
    seed_evento_ids = {
        e.id_evento
        for e in eventos
        if (e.titulo in SEED_EVENT_TITLES or e.creado_por in seed_user_ids or e.id_organizador in seed_user_ids)
    }

    cursos_map = {c.id_curso: c for c in cursos}
    seed_curso_ids = {
        c.id_curso
        for c in cursos
        if (c.nombre_curso in SEED_COURSE_NAMES or c.creado_por in seed_user_ids or c.id_instructor in seed_user_ids)
    }

    lecciones_map = {l.id_leccion: l for l in lecciones}
    seed_leccion_ids = {
        l.id_leccion
        for l in lecciones
        if (
            l.id_curso in seed_curso_ids
            or (l.titulo or "").startswith("Módulo ")
            or l.creado_por in seed_user_ids
        )
    }

    tareas_map = {t.id_tarea: t for t in tareas}
    seed_tarea_ids = {
        t.id_tarea
        for t in tareas
        if (t.id_leccion in seed_leccion_ids or (t.titulo or "").startswith("Práctica de Módulo "))
    }

    pagos_map = {p.id_pago: p for p in pagos}
    ocr_pago_ids = {
        p.id_pago
        for p in pagos
        if (p.porcentaje_ocr is not None or bool(p.texto_ocr and str(p.texto_ocr).strip()))
    }
    seed_pago_ids = {
        p.id_pago
        for p in pagos
        if p.id_pago not in ocr_pago_ids and (p.id_usuario in seed_user_ids or p.creado_por in seed_user_ids)
    }

    pedidos_map = {p.id_pedido: p for p in pedidos}
    productos_map = {p.id_producto: p for p in productos}
    seed_producto_ids = {p.id_producto for p in productos if p.nombre in SEED_PRODUCT_NAMES}

    badges_map = {b.id_badge: b for b in badges}
    seed_badge_ids = {b.id_badge for b in badges if b.nombre_badge in SEED_BADGE_NAMES}

    checkpoints_map = {c.id_checkpoint: c for c in checkpoints}
    inscripciones_ev_map = {i.id_inscripcion: i for i in inscripciones_ev}

    return {
        "users_map": users_map,
        "seed_user_ids": seed_user_ids,
        "eventos_map": eventos_map,
        "seed_evento_ids": seed_evento_ids,
        "cursos_map": cursos_map,
        "seed_curso_ids": seed_curso_ids,
        "lecciones_map": lecciones_map,
        "seed_leccion_ids": seed_leccion_ids,
        "tareas_map": tareas_map,
        "seed_tarea_ids": seed_tarea_ids,
        "pagos_map": pagos_map,
        "ocr_pago_ids": ocr_pago_ids,
        "seed_pago_ids": seed_pago_ids,
        "pedidos_map": pedidos_map,
        "productos_map": productos_map,
        "seed_producto_ids": seed_producto_ids,
        "badges_map": badges_map,
        "seed_badge_ids": seed_badge_ids,
        "checkpoints_map": checkpoints_map,
        "inscripciones_ev_map": inscripciones_ev_map,
    }


def classify_row_origin(tabla: str, record: Any, ctx: Dict[str, Any]) -> Tuple[str, str]:
    """Clasifica un registro en ('SEED' | 'OCR' | 'REAL', detalle)."""
    if tabla == "pagos":
        if record.id_pago in ctx["ocr_pago_ids"]:
            pct = f" ({record.porcentaje_ocr}%)" if record.porcentaje_ocr is not None else ""
            return "OCR", f"Pago procesado con validación OCR{pct}"
        if record.id_pago in ctx["seed_pago_ids"]:
            return "SEED", "Pago generado para usuario de semilla/demo"
        return "REAL", "Pago registrado manualmente / orgánico"

    if tabla == "inscripciones_eventos":
        if getattr(record, "id_pago", None) in ctx["ocr_pago_ids"]:
            return "OCR", "Inscripción vinculada a comprobante OCR"
        if record.id_usuario in ctx["seed_user_ids"] or record.id_evento in ctx["seed_evento_ids"]:
            return "SEED", "Inscripción de usuario o evento de semilla"
        return "REAL", "Inscripción orgánica"

    if tabla == "inscripciones_cursos":
        if getattr(record, "id_pago", None) in ctx["ocr_pago_ids"]:
            return "OCR", "Matrícula vinculada a comprobante OCR"
        if record.id_usuario in ctx["seed_user_ids"] or record.id_curso in ctx["seed_curso_ids"]:
            return "SEED", "Matrícula de usuario o curso de semilla"
        return "REAL", "Matrícula orgánica"

    if tabla == "pedidos":
        if getattr(record, "id_pago", None) in ctx["ocr_pago_ids"]:
            return "OCR", "Pedido vinculado a pago OCR"
        if record.id_usuario in ctx["seed_user_ids"]:
            return "SEED", "Pedido de usuario de semilla"
        return "REAL", "Pedido orgánico"

    if tabla == "usuarios":
        if is_seed_user(record):
            return "SEED", "Cuenta generada por script de semilla (super_seed)"
        return "REAL", "Cuenta registrada orgánicamente"

    if tabla == "eventos":
        if record.id_evento in ctx["seed_evento_ids"]:
            return "SEED", "Evento de demostración (super_seed)"
        return "REAL", "Evento creado por administración"

    if tabla == "cursos":
        if record.id_curso in ctx["seed_curso_ids"]:
            return "SEED", "Curso de demostración (super_seed)"
        return "REAL", "Curso creado por administración"

    if tabla == "lecciones":
        if record.id_leccion in ctx["seed_leccion_ids"]:
            return "SEED", "Lección perteneciente a curso de semilla"
        return "REAL", "Lección creada orgánicamente"

    if tabla == "tareas":
        if record.id_tarea in ctx["seed_tarea_ids"]:
            return "SEED", "Tarea perteneciente a lección de semilla"
        return "REAL", "Tarea creada orgánicamente"

    if tabla == "entregas_tareas":
        if record.id_tarea in ctx["seed_tarea_ids"] or record.id_usuario in ctx["seed_user_ids"]:
            return "SEED", "Entrega asociada a tarea o alumno de semilla"
        return "REAL", "Entrega real de alumno"

    if tabla == "posts_foro":
        if record.id_curso in ctx["seed_curso_ids"] or record.id_usuario in ctx["seed_user_ids"]:
            return "SEED", "Post en curso o usuario de semilla"
        return "REAL", "Participación real en foro"

    if tabla == "productos":
        if record.id_producto in ctx["seed_producto_ids"]:
            return "SEED", "Producto de catálogo demo (super_seed)"
        return "REAL", "Producto registrado en inventario"

    if tabla == "pedido_detalles":
        pedido = ctx["pedidos_map"].get(record.id_pedido)
        if (pedido and pedido.id_usuario in ctx["seed_user_ids"]) or record.id_producto in ctx["seed_producto_ids"]:
            return "SEED", "Detalle de pedido o producto de semilla"
        return "REAL", "Detalle de pedido real"

    if tabla == "badges":
        if record.id_badge in ctx["seed_badge_ids"]:
            return "SEED", "Insignia del catálogo inicial (super_seed)"
        return "REAL", "Insignia personalizada"

    if tabla == "usuarios_badges":
        if record.id_usuario in ctx["seed_user_ids"] or record.id_badge in ctx["seed_badge_ids"]:
            return "SEED", "Asignación automática de semilla"
        return "REAL", "Insignia otorgada en operación real"

    if tabla == "speakers":
        nombre = (record.nombre or "").strip()
        if nombre.startswith("Expert ") or getattr(record, "linkedin_url", "") == "https://linkedin.com/in/expert":
            return "SEED", "Speaker de demostración (super_seed)"
        return "REAL", "Speaker real registrado"

    if tabla == "auspiciadores":
        nombre = (record.nombre or "").strip()
        if nombre.startswith("Tech Sponsor ") or getattr(record, "sitio_web", "") == "https://sponsor.com":
            return "SEED", "Auspiciador de demostración (super_seed)"
        return "REAL", "Auspiciador real registrado"

    if tabla == "comunidades_aliadas":
        nombre = (record.nombre or "").strip()
        if nombre.startswith("Comunidad Dev ") or getattr(record, "link_contacto", "") == "https://facebook.com/devgroup":
            return "SEED", "Comunidad de demostración (super_seed)"
        return "REAL", "Comunidad aliada real"

    if tabla == "anuncios":
        if (record.titulo or "") in SEED_ANNOUNCEMENT_TITLES or getattr(record, "id_autor", None) in ctx["seed_user_ids"]:
            return "SEED", "Anuncio de demostración (super_seed)"
        return "REAL", "Anuncio institucional real"

    if tabla == "configuracion_global":
        if (record.clave or "") in SEED_CONFIG_KEYS:
            return "SEED", "Parámetro inicial de semilla"
        return "REAL", "Configuración del sistema"

    if tabla == "checkpoints":
        if record.id_evento in ctx["seed_evento_ids"]:
            return "SEED", "Checkpoint de evento de semilla"
        return "REAL", "Checkpoint operativo"

    if tabla == "checkpoint_permisos":
        chk = ctx["checkpoints_map"].get(record.id_checkpoint)
        if (chk and chk.id_evento in ctx["seed_evento_ids"]) or record.id_usuario in ctx["seed_user_ids"]:
            return "SEED", "Permiso vinculado a evento/usuario de semilla"
        return "REAL", "Permiso operativo"

    if tabla == "asistencia_detalles":
        ins = ctx["inscripciones_ev_map"].get(record.id_inscripcion)
        if ins and (ins.id_usuario in ctx["seed_user_ids"] or ins.id_evento in ctx["seed_evento_ids"]):
            return "SEED", "Asistencia de inscripción de semilla"
        return "REAL", "Asistencia acreditada en evento"

    if tabla == "eventos_pagos_qr":
        if record.id_evento in ctx["seed_evento_ids"]:
            return "SEED", "QR de pago de evento de semilla"
        return "REAL", "QR de pago configurado"

    if tabla == "certificados":
        if (
            record.id_usuario in ctx["seed_user_ids"]
            or (record.id_evento and record.id_evento in ctx["seed_evento_ids"])
            or (record.id_curso and record.id_curso in ctx["seed_curso_ids"])
        ):
            return "SEED", "Certificado de entidad de semilla"
        return "REAL", "Certificado oficial emitido"

    if tabla == "recursos":
        if (
            (record.id_evento and record.id_evento in ctx["seed_evento_ids"])
            or (record.id_curso and record.id_curso in ctx["seed_curso_ids"])
            or getattr(record, "creado_por", None) in ctx["seed_user_ids"]
        ):
            return "SEED", "Recurso asociado a semilla"
        return "REAL", "Recurso de biblioteca"

    if tabla == "logs_sistema":
        if getattr(record, "id_admin", None) in ctx["seed_user_ids"]:
            return "SEED", "Log originado por cuenta de semilla"
        return "REAL", "Registro de auditoría del sistema"

    return "REAL", "Registro del sistema"


def _resolve_title_and_subtitle(tabla: str, r: Any, ctx: Dict[str, Any]) -> Tuple[str, str]:
    users_map = ctx["users_map"]
    eventos_map = ctx["eventos_map"]
    cursos_map = ctx["cursos_map"]
    badges_map = ctx["badges_map"]
    productos_map = ctx["productos_map"]

    if tabla == "usuarios":
        return f"{r.nombres or ''} {r.apellidos or ''}".strip() or r.correo, f"{r.correo} • {r.rol}"
    if tabla == "eventos":
        return r.titulo or f"Evento #{r.id_evento}", f"{r.tipo_evento or ''} • {r.modalidad or ''} • {r.estado or ''}"
    if tabla == "inscripciones_eventos":
        u = users_map.get(r.id_usuario)
        ev = eventos_map.get(r.id_evento)
        u_str = u.correo if u else f"Usuario #{r.id_usuario}"
        ev_str = ev.titulo if ev else f"Evento #{r.id_evento}"
        return f"{u_str} → {ev_str}", f"Estado: {r.estado_inscripcion} • Asistió: {'Sí' if r.asistio else 'No'}"
    if tabla == "checkpoints":
        ev = eventos_map.get(r.id_evento)
        return r.nombre_checkpoint or f"Checkpoint #{r.id_checkpoint}", f"Evento: {ev.titulo if ev else r.id_evento}"
    if tabla == "asistencia_detalles":
        return f"Escaneo #{r.id_asistencia} (Inscripción #{r.id_inscripcion})", f"Checkpoint #{r.id_checkpoint}"
    if tabla == "checkpoint_permisos":
        u = users_map.get(r.id_usuario)
        return f"Permiso #{r.id_permiso} - {u.correo if u else r.id_usuario}", f"Checkpoint #{r.id_checkpoint}"
    if tabla == "eventos_pagos_qr":
        return r.nombre_paquete or f"QR #{r.id_qr}", f"Monto: Bs {r.monto}"
    if tabla == "cursos":
        return r.nombre_curso or f"Curso #{r.id_curso}", f"{r.horas_academicas or 0} hrs • {r.estado or ''}"
    if tabla == "lecciones":
        return r.titulo or f"Lección #{r.id_leccion}", f"Orden #{r.orden} • Curso #{r.id_curso}"
    if tabla == "tareas":
        return r.titulo or f"Tarea #{r.id_tarea}", f"Lección #{r.id_leccion} • Máx {r.puntos_max} pts"
    if tabla == "entregas_tareas":
        u = users_map.get(r.id_usuario)
        return f"Entrega #{r.id_entrega} ({u.correo if u else r.id_usuario})", f"Tarea #{r.id_tarea} • Nota: {r.nota if r.nota is not None else 'Pendiente'}"
    if tabla == "posts_foro":
        u = users_map.get(r.id_usuario)
        msg = (r.mensaje or "")[:60]
        return f"Post #{r.id_post}: {msg}", f"Autor: {u.correo if u else r.id_usuario}"
    if tabla == "inscripciones_cursos":
        u = users_map.get(r.id_usuario)
        c = cursos_map.get(r.id_curso)
        return f"{u.correo if u else r.id_usuario} → {c.nombre_curso if c else r.id_curso}", f"Progreso: {r.progreso}% • {r.estado_inscripcion}"
    if tabla == "pagos":
        u = users_map.get(r.id_usuario)
        return f"Pago #{r.id_pago} - Bs {r.monto}", f"{r.metodo_pago} • {r.estado_pago} • {u.correo if u else r.id_usuario}"
    if tabla == "pedidos":
        u = users_map.get(r.id_usuario)
        return f"Pedido #{r.id_pedido} - Bs {r.total}", f"Estado: {r.estado} • {u.correo if u else r.id_usuario}"
    if tabla == "pedido_detalles":
        p = productos_map.get(r.id_producto)
        return f"Detalle #{r.id_detalle}: {p.nombre if p else r.id_producto} (x{r.cantidad})", f"Pedido #{r.id_pedido} • Bs {r.precio_unitario}"
    if tabla == "productos":
        return r.nombre or f"Producto #{r.id_producto}", f"Bs {r.precio} • Stock: {r.stock} • {r.categoria}"
    if tabla == "badges":
        return r.nombre_badge or f"Badge #{r.id_badge}", f"{r.puntos} pts • {r.requisito_nivel}"
    if tabla == "usuarios_badges":
        u = users_map.get(r.id_usuario)
        b = badges_map.get(r.id_badge)
        return f"{u.correo if u else r.id_usuario} ← {b.nombre_badge if b else r.id_badge}", f"ID #{r.id_usuario_badge}"
    if tabla == "certificados":
        u = users_map.get(r.id_usuario)
        return f"Certificado {r.codigo_verificacion or r.id_certificado}", f"Usuario: {u.correo if u else r.id_usuario} • {r.formato}"
    if tabla == "recursos":
        return r.titulo or f"Recurso #{r.id_recurso}", f"{r.categoria or ''} • {r.tipo_recurso or ''}"
    if tabla == "anuncios":
        return r.titulo or f"Anuncio #{r.id_anuncio}", f"{r.tipo or ''} • {r.categoria or ''}"
    if tabla == "speakers":
        return r.nombre or f"Speaker #{r.id_speaker}", r.trabajo_actual or r.correo_contacto or ""
    if tabla == "auspiciadores":
        return r.nombre or f"Auspiciador #{r.id_auspiciador}", r.tipo or r.sitio_web or ""
    if tabla == "comunidades_aliadas":
        return r.nombre or f"Comunidad #{r.id_comunidad}", r.link_contacto or ""
    if tabla == "configuracion_global":
        return r.clave or f"Config #{r.id_config}", f"{r.valor or ''} ({r.descripcion or ''})"
    if tabla == "logs_sistema":
        return f"{r.accion or 'LOG'} (#{r.id_log})", f"Tabla: {r.tabla_afectada or '-'} • Reg: {r.id_registro_afectado or '-'}"

    pk_val = getattr(r, CLEANUP_CATALOG[tabla]["pk_field"], "")
    return f"{tabla} #{pk_val}", ""


def _resolve_parent_ref(tabla: str, r: Any, ctx: Dict[str, Any]) -> Optional[cleanup_schema.CleanupParentRef]:
    users_map = ctx["users_map"]
    eventos_map = ctx["eventos_map"]
    cursos_map = ctx["cursos_map"]
    lecciones_map = ctx["lecciones_map"]
    tareas_map = ctx["tareas_map"]
    pedidos_map = ctx["pedidos_map"]
    checkpoints_map = ctx["checkpoints_map"]

    if tabla in ("inscripciones_eventos", "checkpoints", "eventos_pagos_qr") and getattr(r, "id_evento", None):
        ev = eventos_map.get(r.id_evento)
        return cleanup_schema.CleanupParentRef(
            tabla="eventos", id=r.id_evento, etiqueta=ev.titulo if ev else f"Evento #{r.id_evento}"
        )
    if tabla in ("asistencia_detalles", "checkpoint_permisos") and getattr(r, "id_checkpoint", None):
        chk = checkpoints_map.get(r.id_checkpoint)
        return cleanup_schema.CleanupParentRef(
            tabla="checkpoints",
            id=r.id_checkpoint,
            etiqueta=chk.nombre_checkpoint if chk else f"Checkpoint #{r.id_checkpoint}",
        )
    if tabla in ("lecciones", "inscripciones_cursos", "posts_foro") and getattr(r, "id_curso", None):
        c = cursos_map.get(r.id_curso)
        return cleanup_schema.CleanupParentRef(
            tabla="cursos", id=r.id_curso, etiqueta=c.nombre_curso if c else f"Curso #{r.id_curso}"
        )
    if tabla == "tareas" and getattr(r, "id_leccion", None):
        l = lecciones_map.get(r.id_leccion)
        return cleanup_schema.CleanupParentRef(
            tabla="lecciones", id=r.id_leccion, etiqueta=l.titulo if l else f"Lección #{r.id_leccion}"
        )
    if tabla == "entregas_tareas" and getattr(r, "id_tarea", None):
        t = tareas_map.get(r.id_tarea)
        return cleanup_schema.CleanupParentRef(
            tabla="tareas", id=r.id_tarea, etiqueta=t.titulo if t else f"Tarea #{r.id_tarea}"
        )
    if tabla == "pedido_detalles" and getattr(r, "id_pedido", None):
        p = pedidos_map.get(r.id_pedido)
        return cleanup_schema.CleanupParentRef(
            tabla="pedidos", id=r.id_pedido, etiqueta=f"Pedido #{p.id_pedido}" if p else f"Pedido #{r.id_pedido}"
        )
    if tabla in ("pagos", "pedidos", "usuarios_badges", "certificados") and getattr(r, "id_usuario", None):
        u = users_map.get(r.id_usuario)
        return cleanup_schema.CleanupParentRef(
            tabla="usuarios", id=r.id_usuario, etiqueta=u.correo if u else f"Usuario #{r.id_usuario}"
        )
    if tabla == "eventos" and getattr(r, "id_organizador", None):
        u = users_map.get(r.id_organizador)
        return cleanup_schema.CleanupParentRef(
            tabla="usuarios", id=r.id_organizador, etiqueta=u.correo if u else f"Organizador #{r.id_organizador}"
        )
    if tabla == "cursos" and getattr(r, "id_instructor", None):
        u = users_map.get(r.id_instructor)
        return cleanup_schema.CleanupParentRef(
            tabla="usuarios", id=r.id_instructor, etiqueta=u.correo if u else f"Instructor #{r.id_instructor}"
        )
    if tabla == "logs_sistema" and getattr(r, "id_admin", None):
        u = users_map.get(r.id_admin)
        return cleanup_schema.CleanupParentRef(
            tabla="usuarios", id=r.id_admin, etiqueta=u.correo if u else f"Admin #{r.id_admin}"
        )
    return None


def _resolve_dates_and_creator(r: Any, ctx: Dict[str, Any]) -> Tuple[Optional[int], Optional[str], Optional[str], Optional[str]]:
    users_map = ctx["users_map"]
    creator_id = (
        getattr(r, "creado_por", None)
        or getattr(r, "id_autor", None)
        or getattr(r, "id_organizador", None)
        or getattr(r, "id_admin", None)
        or getattr(r, "id_usuario", None)
    )
    creator_name = None
    if creator_id and creator_id in users_map:
        u = users_map[creator_id]
        creator_name = f"{u.nombres or ''} {u.apellidos or ''} ({u.correo})".strip()
    elif creator_id:
        creator_name = f"Usuario #{creator_id}"
    else:
        creator_name = "Sistema / Seed"

    created_dt = (
        getattr(r, "fecha_creacion", None)
        or getattr(r, "fecha_registro", None)
        or getattr(r, "fecha_inscripcion", None)
        or getattr(r, "fecha_pago", None)
        or getattr(r, "fecha_pedido", None)
        or getattr(r, "fecha_publicacion", None)
        or getattr(r, "fecha_emision", None)
        or getattr(r, "fecha_obtencion", None)
        or getattr(r, "fecha_envio", None)
        or getattr(r, "fecha_escaneo", None)
        or getattr(r, "fecha_hora", None)
    )
    modified_dt = getattr(r, "fecha_modificacion", None) or getattr(r, "fecha_modificacion_estado", None)

    created_str = created_dt.isoformat() if isinstance(created_dt, (datetime, date)) else None
    modified_str = modified_dt.isoformat() if isinstance(modified_dt, (datetime, date)) else None
    return creator_id, creator_name, created_str, modified_str


def serialize_row_item(
    db: Session,
    current_user: models.Usuario,
    tabla: str,
    record: Any,
    ctx: Dict[str, Any],
    protected_user_reasons: Dict[int, str],
) -> cleanup_schema.CleanupRowItem:
    cat = CLEANUP_CATALOG[tabla]
    pk_val = getattr(record, cat["pk_field"])
    titulo, subtitulo = _resolve_title_and_subtitle(tabla, record, ctx)
    padre = _resolve_parent_ref(tabla, record, ctx)
    creator_id, creator_name, created_str, modified_str = _resolve_dates_and_creator(record, ctx)
    origen, origen_detalle = classify_row_origin(tabla, record, ctx)
    protegido, motivo_proteccion = is_record_protected(
        db, current_user, tabla, record, protected_user_reasons
    )

    return cleanup_schema.CleanupRowItem(
        id=pk_val,
        tabla=tabla,
        titulo=titulo,
        subtitulo=subtitulo,
        id_estado=getattr(record, "id_estado", 2),
        creado_por_id=creator_id,
        creado_por_nombre=creator_name,
        fecha_creacion=created_str,
        fecha_modificacion=modified_str,
        padre=padre,
        origen=origen,
        origen_detalle=origen_detalle,
        protegido=protegido,
        motivo_proteccion=motivo_proteccion,
    )


def get_catalog_summary(
    db: Session, current_user: models.Usuario
) -> List[cleanup_schema.CleanupTableCatalogItem]:
    ensure_cleanup_admin(current_user)
    ctx = build_classification_context(db)
    protected_user_reasons, _ = get_protected_user_reasons(db, current_user)

    items: List[cleanup_schema.CleanupTableCatalogItem] = []
    # Mostrar primero por grupo/importancia visual, conservando delete_order para ejecución
    for key, info in CLEANUP_CATALOG.items():
        model = info["model"]
        records = db.query(model).execution_options(include_deleted=True).all()
        active_count = 0
        deleted_count = 0
        seed_count = 0
        real_count = 0
        ocr_count = 0
        protected_count = 0

        for r in records:
            est = getattr(r, "id_estado", 2)
            if est == 0:
                deleted_count += 1
            else:
                active_count += 1
            origen, _ = classify_row_origin(key, r, ctx)
            if origen == "SEED":
                seed_count += 1
            elif origen == "OCR":
                ocr_count += 1
            else:
                real_count += 1
            is_prot, _ = is_record_protected(db, current_user, key, r, protected_user_reasons)
            if is_prot:
                protected_count += 1

        deps_raw = DEPENDENCY_MATRIX.get(key, [])
        deps = [
            cleanup_schema.CleanupTableDependencyInfo(
                child_table=d["child_table"],
                child_label=CLEANUP_CATALOG[d["child_table"]]["label"],
                fk_column=d["fk_column"],
                nullable=d["nullable"],
                description=d["description"],
            )
            for d in deps_raw
            if d["child_table"] in CLEANUP_CATALOG
        ]

        items.append(
            cleanup_schema.CleanupTableCatalogItem(
                key=key,
                label=info["label"],
                group=info["group"],
                description=info["description"],
                pk_field=info["pk_field"],
                delete_order=info["delete_order"],
                supports_soft_delete=True,
                supports_hard_delete=True,
                active_count=active_count,
                deleted_count=deleted_count,
                seed_count=seed_count,
                real_count=real_count,
                ocr_count=ocr_count,
                protected_count=protected_count,
                dependencies=deps,
            )
        )

    return items


def list_table_rows(
    db: Session,
    current_user: models.Usuario,
    tabla: str,
    search: Optional[str] = None,
    origen: Optional[str] = None,
    include_deleted: bool = False,
) -> List[cleanup_schema.CleanupRowItem]:
    ensure_cleanup_admin(current_user)
    if tabla not in CLEANUP_CATALOG:
        raise ValidacionNegocioError(f"La tabla '{tabla}' no existe en el catálogo de limpieza")

    info = CLEANUP_CATALOG[tabla]
    model = info["model"]
    pk_col = getattr(model, info["pk_field"])

    query = db.query(model).execution_options(include_deleted=True)
    if not include_deleted:
        query = query.filter(model.id_estado != 0)

    records = query.order_by(pk_col.desc()).all()
    ctx = build_classification_context(db)
    protected_user_reasons, _ = get_protected_user_reasons(db, current_user)

    result: List[cleanup_schema.CleanupRowItem] = []
    search_lower = search.strip().lower() if search else None
    origen_upper = origen.strip().upper() if origen and origen.upper() != "ALL" else None

    for r in records:
        row_item = serialize_row_item(db, current_user, tabla, r, ctx, protected_user_reasons)
        if origen_upper and row_item.origen != origen_upper:
            continue
        if search_lower:
            haystack = f"{row_item.id} {row_item.titulo} {row_item.subtitulo or ''} {row_item.creado_por_nombre or ''} {row_item.padre.etiqueta if row_item.padre else ''}".lower()
            if search_lower not in haystack:
                continue
        result.append(row_item)

    return result


# --- GESTIÓN DE PRESETS (INCLUIDO "DEJAR SOLO SUPERADMIN") ---

BUILT_IN_PRESETS: List[cleanup_schema.CleanupPresetItem] = [
    cleanup_schema.CleanupPresetItem(
        id="keep_only_superadmin",
        nombre="Dejar solo superadmin",
        descripcion="Selecciona todos los registros activos y cuentas de usuario excepto el Superadmin, el administrador en sesión y los correos en lista blanca.",
        built_in=True,
        mode="soft",
        include_dependencies=True,
        origen_filter="ALL",
        tablas=list(CLEANUP_CATALOG.keys()),
    ),
    cleanup_schema.CleanupPresetItem(
        id="only_seed_data",
        nombre="Limpiar solo datos Seed / Demo",
        descripcion="Selecciona todos los registros clasificados como SEED (datos generados por super_seed) en todas las tablas sin afectar datos reales.",
        built_in=True,
        mode="soft",
        include_dependencies=True,
        origen_filter="SEED",
        tablas=list(CLEANUP_CATALOG.keys()),
    ),
    cleanup_schema.CleanupPresetItem(
        id="only_ocr_data",
        nombre="Limpiar pagos e inscripciones OCR",
        descripcion="Selecciona pagos con lectura OCR y sus inscripciones o pedidos vinculados.",
        built_in=True,
        mode="soft",
        include_dependencies=True,
        origen_filter="OCR",
        tablas=["pagos", "inscripciones_eventos", "inscripciones_cursos", "pedidos"],
    ),
    cleanup_schema.CleanupPresetItem(
        id="activity_only",
        nombre="Limpiar actividad transaccional (mantener catálogos)",
        descripcion="Selecciona inscripciones, asistencias, pagos, pedidos y entregas de tareas conservando usuarios, eventos, cursos y productos.",
        built_in=True,
        mode="soft",
        include_dependencies=True,
        origen_filter="ALL",
        tablas=[
            "asistencia_detalles",
            "inscripciones_eventos",
            "inscripciones_cursos",
            "entregas_tareas",
            "posts_foro",
            "pedido_detalles",
            "pedidos",
            "pagos",
        ],
    ),
]


def _load_custom_presets(db: Session) -> List[cleanup_schema.CleanupPresetItem]:
    conf = (
        db.query(models.ConfiguracionGlobal)
        .execution_options(include_deleted=True)
        .filter(models.ConfiguracionGlobal.clave == PRESETS_CONFIG_KEY)
        .first()
    )
    if not conf or not conf.valor:
        return []
    try:
        raw = json.loads(conf.valor)
        if isinstance(raw, list):
            return [cleanup_schema.CleanupPresetItem(**item) for item in raw]
    except Exception:
        pass
    return []


def list_presets(db: Session, current_user: models.Usuario) -> List[cleanup_schema.CleanupPresetItem]:
    ensure_cleanup_admin(current_user)
    return BUILT_IN_PRESETS + _load_custom_presets(db)


def save_custom_preset(
    db: Session,
    current_user: models.Usuario,
    payload: cleanup_schema.CleanupPresetCreateRequest,
) -> cleanup_schema.CleanupPresetItem:
    ensure_cleanup_admin(current_user)
    for t in payload.tablas:
        if t not in CLEANUP_CATALOG:
            raise ValidacionNegocioError(f"Tabla inválida en preset: '{t}'")
    for t in payload.selections.keys():
        if t not in CLEANUP_CATALOG:
            raise ValidacionNegocioError(f"Tabla inválida en selección de preset: '{t}'")

    built_in_ids = {p.id for p in BUILT_IN_PRESETS}
    preset_id = (payload.id or "").strip()
    if not preset_id:
        slug = re.sub(r"[^a-z0-9]+", "_", payload.nombre.strip().lower()).strip("_")
        preset_id = f"custom_{slug or 'preset'}"

    if preset_id in built_in_ids:
        raise ValidacionNegocioError("No se puede sobrescribir un preset nativo del sistema")

    existing = _load_custom_presets(db)
    new_item = cleanup_schema.CleanupPresetItem(
        id=preset_id,
        nombre=payload.nombre.strip(),
        descripcion=(payload.descripcion or "").strip(),
        built_in=False,
        mode=payload.mode,
        include_dependencies=payload.include_dependencies,
        origen_filter=payload.origen_filter,
        tablas=payload.tablas,
        selections=payload.selections,
    )

    updated_list = [p for p in existing if p.id != preset_id] + [new_item]
    conf = _get_or_create_config(
        db,
        PRESETS_CONFIG_KEY,
        json.dumps([p.model_dump() for p in updated_list]),
        "Presets personalizados de limpieza de datos",
        current_user.id_usuario,
    )
    conf.valor = json.dumps([p.model_dump() for p in updated_list])
    conf.id_estado = 2
    db.commit()
    return new_item


def delete_custom_preset(
    db: Session, current_user: models.Usuario, preset_id: str
) -> Dict[str, Any]:
    ensure_cleanup_admin(current_user)
    if any(p.id == preset_id for p in BUILT_IN_PRESETS):
        raise ValidacionNegocioError("No se puede eliminar un preset nativo del sistema")

    existing = _load_custom_presets(db)
    filtered = [p for p in existing if p.id != preset_id]
    if len(filtered) == len(existing):
        raise ValidacionNegocioError(f"El preset '{preset_id}' no existe")

    conf = _get_or_create_config(
        db,
        PRESETS_CONFIG_KEY,
        json.dumps([p.model_dump() for p in filtered]),
        "Presets personalizados de limpieza de datos",
        current_user.id_usuario,
    )
    conf.valor = json.dumps([p.model_dump() for p in filtered])
    db.commit()
    return {"status": "deleted", "id": preset_id}


def resolve_preset_selections(
    db: Session, current_user: models.Usuario, preset_id: str
) -> Dict[str, Any]:
    """Calcula la selección concreta de tablas e IDs para un preset dado, respetando protegidos."""
    ensure_cleanup_admin(current_user)
    all_presets = list_presets(db, current_user)
    preset = next((p for p in all_presets if p.id == preset_id), None)
    if not preset:
        raise ValidacionNegocioError(f"El preset '{preset_id}' no fue encontrado")

    ctx = build_classification_context(db)
    protected_user_reasons, _ = get_protected_user_reasons(db, current_user)
    resolved_selections: Dict[str, List[int]] = {}

    # Si el preset tiene selecciones explícitas guardadas, las filtramos contra registros protegidos
    if preset.selections:
        for tabla, ids in preset.selections.items():
            if tabla not in CLEANUP_CATALOG or not ids:
                continue
            info = CLEANUP_CATALOG[tabla]
            model = info["model"]
            pk_col = getattr(model, info["pk_field"])
            rows = (
                db.query(model)
                .execution_options(include_deleted=True)
                .filter(pk_col.in_(ids))
                .all()
            )
            valid_ids = []
            for r in rows:
                prot, _ = is_record_protected(db, current_user, tabla, r, protected_user_reasons)
                if not prot:
                    valid_ids.append(getattr(r, info["pk_field"]))
            if valid_ids:
                resolved_selections[tabla] = sorted(set(valid_ids))
    else:
        target_tables = preset.tablas or list(CLEANUP_CATALOG.keys())
        for tabla in target_tables:
            if tabla not in CLEANUP_CATALOG:
                continue
            info = CLEANUP_CATALOG[tabla]
            model = info["model"]
            rows = (
                db.query(model)
                .execution_options(include_deleted=True)
                .filter(model.id_estado != 0)
                .all()
            )
            matched_ids: List[int] = []
            for r in rows:
                prot, _ = is_record_protected(db, current_user, tabla, r, protected_user_reasons)
                if prot:
                    continue
                if preset.origen_filter != "ALL":
                    origen, _ = classify_row_origin(tabla, r, ctx)
                    if origen != preset.origen_filter:
                        continue
                matched_ids.append(getattr(r, info["pk_field"]))
            if matched_ids:
                resolved_selections[tabla] = sorted(set(matched_ids))

    return {
        "preset": preset.model_dump(),
        "selections": resolved_selections,
        "mode": preset.mode,
        "include_dependencies": preset.include_dependencies,
    }
