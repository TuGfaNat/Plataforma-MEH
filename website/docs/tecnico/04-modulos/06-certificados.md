---
id: "06"
title: "Certificados"
sidebar_position: 6
---

# Certificados

> **⚠️ [GENERADO AUTOMÁTICAMENTE]:** Esta documentación fue generada a partir del análisis estático del código fuente de Plataforma MEH.

## Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M06-001 | Uso de arquitectura en capas | Monolito o lógica en routers | Mantenibilidad y reusabilidad | Mayor cantidad de archivos y abstracciones |

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
    certificados {
        id_certificado string
        id_usuario string
        id_curso string
        id_evento string
        uuid_verificacion string
        codigo_verificacion string
        fecha_emision string
        url_pdf string
        formato string
        entregado_fisico string
        es_ruta_linkedin string
        metadata_adicional string
    }
```

### Tabla: `certificados`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_certificado | `Integer, primary_key=True, index=True` | - |
| id_usuario | `Integer, ForeignKey("usuarios.id_usuario")` | - |
| id_curso | `Integer, ForeignKey("cursos.id_curso"), nullable=True` | - |
| id_evento | `Integer, ForeignKey("eventos.id_evento"), nullable=True` | - |
| uuid_verificacion | `String, default=lambda: str(uuid.uuid4()), unique=True` | - |
| codigo_verificacion | `String, unique=True` | - |
| fecha_emision | `DateTime, default=datetime.utcnow` | - |
| url_pdf | `String` | - |
| formato | `String, default="DIGITAL"` | - |
| entregado_fisico | `Boolean, default=False` | - |
| es_ruta_linkedin | `Boolean, default=False` | - |
| metadata_adicional | `TEXT, nullable=True` | - |

## Sección M3 — Contratos de APIs

| Método | URI |
|---|---|
| POST | `/api/v1/certificados_admin/bulk` |

## Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Para información sobre la trazabilidad, se usa `AuditMixin` en los modelos para capturar el usuario creador/modificador.

## Sección M5 — Frontend (por módulo)

Revisar la carpeta `frontend/src/` para componentes asociados a este módulo.

## Sección M6 — Migraciones

* Las migraciones asociadas a estas tablas se encuentran en `alembic/versions/`.
