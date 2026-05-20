---
id: index-03-decisiones-arquitectonicas
title: 03. Decisiones Arquitectónicas (ADRs)
---

# Decisiones Arquitectónicas (ADRs)

| ID | Título | Decisión | Justificación |
|---|---|---|---|
| ADR-001 | Framework Frontend | **Fluent UI v9** con React + JSX | Componentes accesibles, rendimiento mejorado con Griffel (CSS-in-JS). Se usa `.jsx` en lugar de `.tsx`. |
| ADR-002 | Modelo de Datos | **INTEGER SERIAL** | Se priorizó el rendimiento de índices y legibilidad frente a `UUID`. Las PKs usan `Integer` y `autoincrement=True`. |
| ADR-003 | ORM Backend | **SQLAlchemy Síncrono** | Reduce la complejidad de las transacciones (sin lazy loading errors asíncronos). Uso de `Session` de `psycopg2`. |
| ADR-004 | Seguridad (JWT) | **python-jose (HS256)** | Implementación ligera y robusta de JWT para la autenticación sin necesidad de infraestructuras PKI complejas. |
