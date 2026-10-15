---
id: decisiones-arquitectonicas
title: Decisiones Arquitectónicas (ADRs)
sidebar_label: Decisiones Arquitectónicas (ADRs)
---

# Decisiones Arquitectónicas (ADRs)

Registro formal de decisiones arquitectónicas fundamentales que rigen el desarrollo y evolución de Plataforma MEH.

| ID | Título | Decisión | Alternativas Evaluadas | Justificación y Consecuencias |
|---|---|---|---|---|
| **ADR-001** | Framework Frontend | **Fluent UI v9** con React + JSX | Material UI, Tailwind CSS, Ant Design | Componentes accesibles, tokens semánticos nativos de Microsoft y alto rendimiento con Griffel (CSS-in-JS). Se usa `.jsx` puro. |
| **ADR-002** | Modelo de Claves Primarias | **INTEGER SERIAL** (Autoincremental) | UUID v4 / ULID | Se priorizó el rendimiento de índices B-Tree, menor fragmentación en disco y simplicidad en URLs y claves foráneas en PostgreSQL. |
| **ADR-003** | ORM y Concurrencia | **SQLAlchemy Síncrono** sobre `psycopg2` | SQLAlchemy Asyncio, Tortoise ORM | Previene lazy-loading bugs asíncronos y carreras transaccionales en operaciones financieras críticas (conciliación de vouchers y emisión de certificados). |
| **ADR-004** | Protocolo de Autenticación | **JWT (HS256)** con `python-jose` | OAuth2 con servidor externo, Session Cookies | Desacoplamiento de la API, almacenamiento stateless de tokens, y validación criptográfica instantánea tanto en backend como frontend. |
