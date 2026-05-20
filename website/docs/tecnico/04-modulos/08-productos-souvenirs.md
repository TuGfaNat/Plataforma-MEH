---
id: 08
title: Productos y Souvenirs
sidebar_label: Productos y Souvenirs
---

# Productos y Souvenirs

### M0 — Decisiones Arquitectónicas Locales

:::note Decisión Local
Se aplica el uso estricto de **SQLAlchemy Síncrono** y Pydantic para la serialización de datos de este módulo.
:::

### M1 — Arquitectura del Módulo

```mermaid
graph LR
    API[Router: /api/v1/souvenirs] --> Service[Service: souvenirs_service.py]
    Service --> Models[Modelos SQLAlchemy]
    Models --> DB[(PostgreSQL Síncrono)]
```

### M2 — Diccionario de Datos

Los modelos utilizan `INTEGER SERIAL` exclusivamente. No se permiten `UUIDs`.

| Entidad Principal | PK (INTEGER) | Auditoría |
|---|---|---|
| `Souvenirs` | `id_sou` | `AuditMixin` presente |

### M3 — Contratos de APIs

| Método | URI Real | Body | Status |
|---|---|---|---|
| GET | `/api/v1/souvenirs/` | Depende | 200/201 OK |\n| POST | `/api/v1/souvenirs/` | Depende | 200/201 OK |\n| PUT | `/api/v1/souvenirs/{id_producto}` | Depende | 200/201 OK |\n| DELETE | `/api/v1/souvenirs/{id_producto}` | Depende | 200/201 OK |\n| POST | `/api/v1/souvenirs/ventas` | Depende | 200/201 OK |\n| GET | `/api/v1/souvenirs/ventas` | Depende | 200/201 OK |

### M4 — Lógica Núcleo

Todo proceso de base de datos se realiza de manera bloqueante (Sync), garantizando atomicidad mediante `db.commit()` estándar.

### M5 — Frontend

Los componentes del frontend utilizan **React, JSX puro y Fluent UI v9**.
- Las llamadas usan `fetch` o `axios` apuntando a las rutas de M3.
- No se admite el uso de `.tsx`.

### M6 — Migraciones Relacionadas

Las migraciones de Alembic correspondientes se aplican a este modelo en orden secuencial.
