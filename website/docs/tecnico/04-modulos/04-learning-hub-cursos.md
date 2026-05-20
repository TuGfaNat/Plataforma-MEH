---
id: 04-learning-hub-cursos
title: Learning Hub (Cursos)
sidebar_label: Learning Hub (Cursos)
---

# Learning Hub (Cursos)

### Sección M0 — Decisiones Arquitectónicas Locales (ADR)

| ID | Decisión | Alternativas consideradas | Justificación | Consecuencias |
|---|---|---|---|---|
| ADR-M04-001 | Uso de FastAPI Routers dedicados | Un solo router monolítico | Mejor separación de responsabilidades y modularidad | Mayor cantidad de archivos, pero código más mantenible |

### Sección M1 — Arquitectura del Módulo (C4 Nivel 3 + Ciclo de Vida)

```mermaid
graph TD
    Router[Router: /api/v1/learning] --> Service[Service Layer: cursos_service.py]
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
Figura 1. *Diagrama ER de Learning Hub (Cursos).*

```mermaid
erDiagram
    LEARNING ||--o{ RELACION : "1:N"
```

| Nombre del Campo | Tipo de Dato | Restricciones de Integridad |
|---|---|---|
| id | INTEGER | PK, index=True, autoincrement |

### Sección M3 — Contratos de APIs

| Método | URI | Request Payload | Response |
|---|---|---|---|
| GET | `/api/v1/learning` | - | `200 OK` |

### Sección M4 — Ingeniería Avanzada y Algoritmos Núcleo

Detalles de implementación específica para Learning Hub (Cursos).

### Sección M5 — Frontend

- **Ruta:** `/learning`
- **Conexión con backend:** Hook hacia `/api/v1/learning`

### Sección M6 — Migraciones

- **Alembic:** Ver tabla de migraciones global.
