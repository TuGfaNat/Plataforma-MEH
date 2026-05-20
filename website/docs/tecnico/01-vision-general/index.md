---
id: index-01-vision-general
title: 01. Visión General
---

# Visión General

Plataforma-MEH es un sistema integral para la gestión de comunidades, eventos, cursos (Learning Hub), certificados y pagos.

## Stack Tecnológico (Versiones Exactas)
- **Backend:** Python 3.11+, FastAPI 0.104+, SQLAlchemy 2.0+ (Síncrono), psycopg2-binary, python-jose (HS256)
- **Frontend:** React 18, Vite 5, Fluent UI v9 (`@fluentui/react-components`), React Router DOM 6
- **Base de Datos:** PostgreSQL 15+ (usando `INTEGER SERIAL`, sin UUIDs).

## Diagramas C4

### Nivel 1: Contexto
```mermaid
C4Context
    title Nivel 1: Contexto de Plataforma-MEH
    Person(miembro, "Miembro de la Comunidad", "Usuario final que asiste a eventos y toma cursos")
    Person(admin, "Administrador", "Gestiona la plataforma, valida pagos")
    System(meh, "Plataforma MEH", "Sistema central de eventos, academias y gamificación")
    System_Ext(banco, "Entidad Bancaria", "Validación manual de transferencias/pagos")
    
    Rel(miembro, meh, "Usa la plataforma para eventos y cursos")
    Rel(admin, meh, "Administra el sistema")
    Rel(meh, banco, "Conciliación de pagos (OCR)")
```

### Nivel 2: Contenedores
```mermaid
C4Container
    title Nivel 2: Contenedores de Plataforma-MEH
    Person(usuario, "Usuario")
    Container(spa, "Single Page App", "React + Vite + Fluent UI v9", "Interfaz web para todos los roles")
    Container(api, "API Gateway", "FastAPI + Python", "Backend REST síncrono")
    ContainerDb(db, "Base de Datos Principal", "PostgreSQL", "Almacena usuarios, eventos, pagos (Integer Serial)")
    
    Rel(usuario, spa, "Interactúa vía navegador")
    Rel(spa, api, "Llamadas REST", "JSON/HTTPS")
    Rel(api, db, "Lectura/Escritura Síncrona", "psycopg2")
```
