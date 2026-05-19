---
id: "05"
title: "Gamificación (Badges)"
sidebar_position: 5
---

# Gamificación (Badges)

> **⚠️ [GENERADO AUTOMÁTICAMENTE]:** Esta documentación fue generada a partir del análisis estático del código fuente de Plataforma MEH.

## Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M05-001 | Uso de arquitectura en capas | Monolito o lógica en routers | Mantenibilidad y reusabilidad | Mayor cantidad de archivos y abstracciones |

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
    badges {
        id_badge string
        nombre_badge string
        descripcion string
        imagen_url string
        id_evento_origen string
        id_curso_origen string
        puntos string
        requisito_nivel string
    }
    usuarios_badges {
        id_usuario_badge string
        id_usuario string
        id_badge string
        fecha_obtencion string
    }
```

### Tabla: `badges`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_badge | `Integer, primary_key=True, index=True` | - |
| nombre_badge | `String` | - |
| descripcion | `TEXT, nullable=True` | - |
| imagen_url | `TEXT` | - |
| id_evento_origen | `Integer, ForeignKey("eventos.id_evento"), nullable=True` | - |
| id_curso_origen | `Integer, ForeignKey("cursos.id_curso"), nullable=True` | - |
| puntos | `Integer, default=10` | - |
| requisito_nivel | `String, default="Beginner"` | - |

### Tabla: `usuarios_badges`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_usuario_badge | `Integer, primary_key=True, index=True` | - |
| id_usuario | `Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE")` | - |
| id_badge | `Integer, ForeignKey("badges.id_badge", ondelete="CASCADE")` | - |
| fecha_obtencion | `DateTime, default=datetime.utcnow` | - |

## Sección M3 — Contratos de APIs

| Método | URI |
|---|---|
| GET | `/api/v1/badges/` |
| POST | `/api/v1/badges/` |
| PUT | `/api/v1/badges/{id_badge}` |
| DELETE | `/api/v1/badges/{id_badge}` |
| GET | `/api/v1/badges/usuario/{id_usuario}` |
| POST | `/api/v1/badges/asignar` |

## Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Para información sobre la trazabilidad, se usa `AuditMixin` en los modelos para capturar el usuario creador/modificador.

## Sección M5 — Frontend (por módulo)

Revisar la carpeta `frontend/src/` para componentes asociados a este módulo.

## Sección M6 — Migraciones

* Las migraciones asociadas a estas tablas se encuentran en `alembic/versions/`.
