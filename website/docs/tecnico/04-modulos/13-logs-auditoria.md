---
id: "13"
title: "Logs / Auditoría"
sidebar_position: 13
---

# Logs / Auditoría

> **⚠️ [GENERADO AUTOMÁTICAMENTE]:** Esta documentación fue generada a partir del análisis estático del código fuente de Plataforma MEH.

## Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M13-001 | Uso de arquitectura en capas | Monolito o lógica en routers | Mantenibilidad y reusabilidad | Mayor cantidad de archivos y abstracciones |

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
    logs_sistema {
        id_log string
        id_admin string
        accion string
        tabla_afectada string
        id_registro_afectado string
        valor_anterior string
        valor_nuevo string
        fecha_hora string
        ip_direccion string
    }
```

### Tabla: `logs_sistema`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_log | `Integer, primary_key=True, index=True` | - |
| id_admin | `Integer, ForeignKey("usuarios.id_usuario")` | - |
| accion | `String` | - |
| tabla_afectada | `String` | - |
| id_registro_afectado | `Integer` | - |
| valor_anterior | `TEXT, nullable=True` | - |
| valor_nuevo | `TEXT, nullable=True` | - |
| fecha_hora | `DateTime, default=datetime.utcnow` | - |
| ip_direccion | `String, nullable=True` | - |

## Sección M3 — Contratos de APIs

| Método | URI |
|---|---|
| GET | `/api/v1/logs/` |

## Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Para información sobre la trazabilidad, se usa `AuditMixin` en los modelos para capturar el usuario creador/modificador.

## Sección M5 — Frontend (por módulo)

Revisar la carpeta `frontend/src/` para componentes asociados a este módulo.

## Sección M6 — Migraciones

* Las migraciones asociadas a estas tablas se encuentran en `alembic/versions/`.
