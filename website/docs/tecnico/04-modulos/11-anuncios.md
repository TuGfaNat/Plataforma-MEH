---
id: "11"
title: "Anuncios"
sidebar_position: 11
---

# Anuncios

> **⚠️ [GENERADO AUTOMÁTICAMENTE]:** Esta documentación fue generada a partir del análisis estático del código fuente de Plataforma MEH.

## Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M11-001 | Uso de arquitectura en capas | Monolito o lógica en routers | Mantenibilidad y reusabilidad | Mayor cantidad de archivos y abstracciones |

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
    anuncios {
        id_anuncio string
        titulo string
        contenido string
        url_imagen string
        link_accion string
        tipo string
        fecha_publicacion string
        id_autor string
        activo string
    }
```

### Tabla: `anuncios`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_anuncio | `Integer, primary_key=True, index=True` | - |
| titulo | `String` | - |
| contenido | `TEXT` | - |
| url_imagen | `String, nullable=True` | - |
| link_accion | `String, nullable=True` | - |
| tipo | `String, default="INFO"` | - |
| fecha_publicacion | `DateTime, default=datetime.utcnow` | - |
| id_autor | `Integer, ForeignKey("usuarios.id_usuario"), nullable=True` | - |
| activo | `Boolean, default=True` | - |

## Sección M3 — Contratos de APIs

[SIN ENDPOINTS PROPIOS]

## Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Para información sobre la trazabilidad, se usa `AuditMixin` en los modelos para capturar el usuario creador/modificador.

## Sección M5 — Frontend (por módulo)

Revisar la carpeta `frontend/src/` para componentes asociados a este módulo.

## Sección M6 — Migraciones

* Las migraciones asociadas a estas tablas se encuentran en `alembic/versions/`.
