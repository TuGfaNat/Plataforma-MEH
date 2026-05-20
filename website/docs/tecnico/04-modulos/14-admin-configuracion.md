---
id: "14"
title: "Admin / Configuración Global"
sidebar_position: 14
---

# Admin / Configuración Global

> **⚠️ [GENERADO AUTOMÁTICAMENTE]:** Esta documentación fue generada a partir del análisis estático del código fuente de Plataforma MEH.

## Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M14-001 | Uso de arquitectura en capas | Monolito o lógica en routers | Mantenibilidad y reusabilidad | Mayor cantidad de archivos y abstracciones |

## Sección M1 — Arquitectura del Módulo (C4 Nivel 3 + Ciclo de Vida)

```mermaid
graph TD
    Router[Router: /api/v1/...] --> Service[Service Layer]
    Service --> Model[Modelo ORM]
    Service --> AuditMixin[AuditMixin]
```

Ciclo de vida de una petición típica:
1. Llegada al Router (FastAPI).
2. Validación Pydantic.
3. Inyección de dependencia (get_db).
4. Ejecución en Service Layer.
5. Persistencia.
6. Auditoría.
7. Respuesta serializada.

## Sección M2 — Diccionario de Datos

```mermaid
erDiagram
    configuracion_global {
        id_config string
        clave string
        valor string
        descripcion string
    }
```

### Tabla: `configuracion_global`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_config | `Integer, primary_key=True` | - |
| clave | `String, unique=True` | - |
| valor | `TEXT` | - |
| descripcion | `String, nullable=True` | - |

## Sección M3 — Contratos de APIs

| Método | URI |
|---|---|
| GET | `/api/v1/admin_directories/speakers` |
| POST | `/api/v1/admin_directories/speakers` |
| PUT | `/api/v1/admin_directories/speakers/{id_speaker}` |
| DELETE | `/api/v1/admin_directories/speakers/{id_speaker}` |
| GET | `/api/v1/admin_directories/auspiciadores` |
| POST | `/api/v1/admin_directories/auspiciadores` |
| PUT | `/api/v1/admin_directories/auspiciadores/{id_auspiciador}` |
| DELETE | `/api/v1/admin_directories/auspiciadores/{id_auspiciador}` |
| GET | `/api/v1/admin_directories/comunidades` |
| POST | `/api/v1/admin_directories/comunidades` |
| PUT | `/api/v1/admin_directories/comunidades/{id_comunidad}` |
| DELETE | `/api/v1/admin_directories/comunidades/{id_comunidad}` |

## Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Para información sobre la trazabilidad, se usa `AuditMixin` en los modelos para capturar el usuario creador/modificador.

## Sección M5 — Frontend (por módulo)

Revisar la carpeta `frontend/src/` para componentes asociados a este módulo.

## Sección M6 — Migraciones

* Las migraciones asociadas a estas tablas se encuentran en `alembic/versions/`.
