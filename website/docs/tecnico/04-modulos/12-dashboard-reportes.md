---
id: 12-dashboard-reportes
title: Dashboard / Reportes
sidebar_label: Dashboard / Reportes
---

# Dashboard / Reportes

### Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M12-001 | Uso de FastAPI Routers dedicados | Un solo router monolítico | Mejor separación de responsabilidades y modularidad | Mayor cantidad de archivos, pero código más mantenible |

### Sección M1 — Arquitectura del Módulo (C4 Nivel 3 + Ciclo de Vida)

```mermaid
graph TD
    Router[Router: /api/v1/dashboard] --> Service[Service Layer: dashboard_service.py]
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
Figura 1. *Diagrama ER de Dashboard / Reportes.*

```mermaid
erDiagram
    DASHBOARD ||--o{ RELACION : "1:N"
```

| Nombre del Campo | Tipo de Dato | Restricciones de Integridad |
|---|---|---|
| id | INTEGER | PK, index=True, autoincrement |

### Sección M3 — Contratos de APIs

| Método | URI | Request Payload | Response |
|---|---|---|---|
| GET | `/api/v1/dashboard` | - | `200 OK` |

### Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Detalles de implementación específica para Dashboard / Reportes.

### Sección M5 — Frontend

- **Ruta:** `/dashboard`
- **Conexión con backend:** Hook hacia `/api/v1/dashboard`

### Sección M6 — Migraciones

- **Alembic:** Ver tabla de migraciones global.
