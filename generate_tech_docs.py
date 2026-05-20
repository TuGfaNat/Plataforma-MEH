import os
import re

BASE_DIR = 'website/docs/tecnico'
MODULOS_DIR = f'{BASE_DIR}/04-modulos'

MODULOS = [
    ("01-auth-identidad.md", "Auth / Identidad y Acceso", "auth.py", "auth_service.py", "Gestión de autenticación, login y tokens JWT.", True),
    ("02-eventos.md", "Eventos", "eventos.py", "eventos_service.py", "Gestión de eventos, speakers y auspiciadores.", True),
    ("03-inscripciones-asistencia.md", "Inscripciones y Asistencia", "inscripciones.py", "inscripciones_service.py", "Registro de miembros a eventos y control de asistencia.", True),
    ("04-learning-hub-cursos.md", "Learning Hub (Cursos)", "cursos.py", "cursos_service.py", "Plataforma de cursos y lecciones.", True),
    ("05-gamificacion-badges.md", "Gamificación (Badges)", "badges.py", "badge_service.py", "Sistema de puntos e insignias.", True),
    ("06-certificados.md", "Certificados", "certificados_admin.py", "certificado_generator_service.py", "Emisión y validación de certificados.", True),
    ("07-pagos-ocrn.md", "Pagos / OCRM", "pagos.py", "pagos_service.py", "Gestión de comprobantes y conciliación bancaria.", True),
    ("08-productos-souvenirs.md", "Souvenirs / Productos", "souvenirs.py", "souvenirs_service.py", "Tienda de productos oficiales de la comunidad.", True),
    ("09-academia.md", "Academia", "academia.py", "academia_service.py", "Gestión académica y validación de talentos.", True),
    ("10-recursos.md", "Recursos", "recursos.py", "recurso_service.py", "Gestión de archivos estáticos y recursos descargables.", True),
    ("11-anuncios.md", "Anuncios", "", "", "Sistema de notificaciones y anuncios globales.", False),
    ("12-dashboard-reportes.md", "Dashboard / Reportes", "dashboard.py", "dashboard_service.py", "Analítica y métricas para administradores.", True),
    ("13-logs-auditoria.md", "Logs / Auditoría", "logs.py", "logs_service.py", "Trazabilidad de cambios en la base de datos (AuditMixin).", True),
    ("14-admin-configuracion.md", "Admin / Configuración Global", "admin_directories.py", "", "Ajustes globales del sistema.", True),
    ("15-files.md", "Files / Archivos", "files.py", "", "Microservicio interno de manejo de archivos multimedia.", False)
]

def create_module_doc(filename, title, router, service, desc, has_code):
    id_name = filename.replace('.md', '')

    if not has_code:
        content = f"""---
id: {id_name}
title: {title}
sidebar_label: {title}
---

# {title}

> **⚠️ [DESACTUALIZADO]:** Esta sección parece no reflejar el estado actual del código fuente.
> Pendiente de verificación. Fecha de detección: 2024-05-19.

[MÓDULO NO IMPLEMENTADO EN CÓDIGO]
"""
    else:
        content = f"""---
id: {id_name}
title: {title}
sidebar_label: {title}
---

# {title}

### Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M{id_name.split('-')[0]}-001 | Uso de FastAPI Routers dedicados | Un solo router monolítico | Mejor separación de responsabilidades y modularidad | Mayor cantidad de archivos, pero código más mantenible |

### Sección M1 — Arquitectura del Módulo (C4 Nivel 3 + Ciclo de Vida)

```mermaid
graph TD
    Router[Router: /api/v1/{title.split()[0].lower()}] --> Service[Service Layer: {service}]
    Service --> Model[Modelo ORM]
    Service --> AuditMixin[AuditMixin]
```

```mermaid
sequenceDiagram
    Client->>Router: Petición HTTP
    Router->>Schema: Valida payload
    Schema-->>Router: OK
    Router->>Service: Procesar
    Service->>DB: commit()
    Service-->>Router: Resultado
    Router-->>Client: 200/201 OK
```

### Sección M2 — Diccionario de Datos

[PUNTO DE INSERCIÓN MULTIMEDIA]
Tipo: Diagrama Entidad-Relación
Descripción: Diagrama ER del módulo.
Figura 1. *Diagrama ER de {title}.*

```mermaid
erDiagram
    {title.split()[0].upper()} ||--o{{ RELACION : "1:N"
```

| Nombre del Campo | Tipo de Dato | Restricciones de Integridad |
|---|---|---|
| id | INTEGER | PK, index=True, autoincrement |

### Sección M3 — Contratos de APIs

| Método | URI | Request Payload | Response |
|---|---|---|---|
| GET | `/api/v1/{title.split()[0].lower()}` | - | `200 OK` |

### Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Detalles de implementación específica para {title}.

### Sección M5 — Frontend

- **Ruta:** `/{title.split()[0].lower()}`
- **Conexión con backend:** Hook hacia `/api/v1/{title.split()[0].lower()}`

### Sección M6 — Migraciones

- **Alembic:** Ver tabla de migraciones global.
"""

    with open(f"{MODULOS_DIR}/{filename}", "w", encoding="utf-8") as f:
        f.write(content)

os.makedirs(MODULOS_DIR, exist_ok=True)
os.makedirs(f'{BASE_DIR}/01-vision-general', exist_ok=True)
os.makedirs(f'{BASE_DIR}/02-mapa-dependencias', exist_ok=True)
os.makedirs(f'{BASE_DIR}/03-decisiones-arquitectonicas', exist_ok=True)
os.makedirs(f'{BASE_DIR}/05-apendices', exist_ok=True)

# Generate index files for empty directories
for directory in ['01-vision-general', '02-mapa-dependencias', '03-decisiones-arquitectonicas', '05-apendices']:
    with open(f"{BASE_DIR}/{directory}/index.md", "w") as f:
        f.write(f"---\nid: index-{directory}\ntitle: {directory.replace('-', ' ').title()}\n---")

with open(f"{BASE_DIR}/index.md", "w") as f:
    f.write("---\nid: index\ntitle: Documentación Técnica\n---\n# Documentación Técnica\n")

with open(f"{MODULOS_DIR}/index.md", "w") as f:
    f.write("---\nid: index-04-modulos\ntitle: Módulos del Sistema\n---\n# Módulos del Sistema\n")

with open(f"{BASE_DIR}/06-historial-cambios.md", "w") as f:
    f.write("---\nid: 06-historial-cambios\ntitle: Historial de Cambios\n---\n# Historial de Cambios - Documentación Técnica\n| Fecha | Módulo | Tipo de Cambio | Descripción | Autor |\n|---|---|---|---|---|\n| 2024-05-19 | Todos | Creación | Documentación técnica inicial | Gem |")

for mod in MODULOS:
    create_module_doc(*mod)

print("Documentación técnica generada correctamente.")
