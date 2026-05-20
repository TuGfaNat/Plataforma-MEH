---
id: "07"
title: "Pagos / OCRM"
sidebar_position: 7
---

# Pagos / OCRM

> **⚠️ [GENERADO AUTOMÁTICAMENTE]:** Esta documentación fue generada a partir del análisis estático del código fuente de Plataforma MEH.

## Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M07-001 | Uso de arquitectura en capas | Monolito o lógica en routers | Mantenibilidad y reusabilidad | Mayor cantidad de archivos y abstracciones |

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
    pagos {
        id_pago string
        id_usuario string
        monto string
        fecha_pago string
        metodo_pago string
        estado_pago string
        comprobante_url string
        id_referencia string
        tipo_referencia string
        validado_por string
        url_comprobante string
        fecha_validacion string
        notas_admin string
    }
```

### Tabla: `pagos`

| Nombre del Campo | Tipo de Dato | Restricciones |
|---|---|---|
| id_pago | `Integer, primary_key=True, index=True` | - |
| id_usuario | `Integer, ForeignKey("usuarios.id_usuario"), index=True` | - |
| monto | `Numeric(10, 2)` | - |
| fecha_pago | `DateTime, default=datetime.utcnow` | - |
| metodo_pago | `String` | - |
| estado_pago | `String, default="PENDIENTE"` | - |
| comprobante_url | `TEXT, nullable=True` | - |
| id_referencia | `Integer` | - |
| tipo_referencia | `String` | - |
| validado_por | `Integer, ForeignKey("usuarios.id_usuario"), nullable=True, index=True` | - |
| url_comprobante | `String, nullable=True` | - |
| fecha_validacion | `DateTime, nullable=True` | - |
| notas_admin | `TEXT, nullable=True` | - |

## Sección M3 — Contratos de APIs

| Método | URI |
|---|---|
| POST | `/api/v1/pagos/upload-comprobante` |
| GET | `/api/v1/pagos/mis-pagos` |
| GET | `/api/v1/pagos/admin/todos` |
| PUT | `/api/v1/pagos/admin/{id_pago}/validar` |
| POST | `/api/v1/pagos/admin/ocrm-match` |

## Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Para información sobre la trazabilidad, se usa `AuditMixin` en los modelos para capturar el usuario creador/modificador.

## Sección M5 — Frontend (por módulo)

Revisar la carpeta `frontend/src/` para componentes asociados a este módulo.

## Sección M6 — Migraciones

* Las migraciones asociadas a estas tablas se encuentran en `alembic/versions/`.
