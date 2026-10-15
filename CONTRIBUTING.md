# Guía de Contribución — Plataforma MEH

¡Gracias por tu interés en contribuir a la **Plataforma Microsoft Education Hub (MEH)**!

Este proyecto se rige por estándares profesionales de ingeniería de software, arquitectura de monolito modular y la filosofía **Docs-as-Code**.

---

## 📋 Tabla de Contenidos
1. [Flujo de Trabajo y Ramas](#1-flujo-de-trabajo-y-ramas)
2. [Docs-as-Code (ISO/IEC/IEEE 26511-26515 & Diátaxis)](#2-docs-as-code-isoicieee-26511-26515--diátaxis)
3. [Automatización de Documentación (`docs_gen.py`)](#3-automatización-de-documentación-docs_genpy)
4. [Historial de Cambios (Keep a Changelog + SemVer)](#4-historial-de-cambios-keep-a-changelog--semver)
5. [Validación Local y Pre-PR Checklist](#5-validación-local-y-pre-pr-checklist)

---

## 1. Flujo de Trabajo y Ramas

- **Rama Principal (`main`):** Código de producción listo para despliegue. Todos los cambios ingresan vía Pull Request (PR).
- **Nombres de Rama:** Usar identificadores de ticket descriptivos:
  - `feat/<ticket>-<descripcion>`
  - `fix/<ticket>-<descripcion>`
  - `docs/<ticket>-<descripcion>`
- **Commits:** Seguir Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

---

## 2. Docs-as-Code (ISO/IEC/IEEE 26511-26515 & Diátaxis)

La documentación es un ciudadano de primera clase en el repositorio. Aplicamos los estándares:
- **ISO/IEC/IEEE 26511-26515:** Requisitos de completitud, precisión técnica y estructuración para la documentación de sistemas.
- **Diátaxis (4 Modos de Documentación):**
  1. **Tutoriales:** Orientados al aprendizaje práctico guiado (Primeros pasos, instalación rápida).
  2. **Guías Prácticas (How-To):** Orientadas a tareas y resolución de problemas por rol (Miembros, Organizadores, Soporte, Administradores, Troubleshooting).
  3. **Referencia:** Información técnica descriptiva y rigurosa (Contratos REST M3, Diccionario de Datos M2, Matriz RBAC).
  4. **Explicación:** Comprensión arquitectónica, decisiones de diseño (ADRs), modelo C4 y justificación teórica.

---

## 3. Automatización de Documentación (`docs_gen.py`)

La documentación de referencia se deriva automáticamente del código fuente mediante `tools/docs_gen.py`:
- **Contratos de APIs (M3):** Analiza los decoradores `@router.(get|post|put|delete)` en `backend/app/api/*.py`.
- **Diccionario de Datos (M2):** Analiza las clases SQLAlchemy y columnas en `backend/app/models/models.py` (garantizando el estándar `INTEGER SERIAL`).
- **Matriz de Control de Acceso (RBAC):** Extrae roles, jerarquías y permisos desde `backend/app/core/permissions.py` y `frontend/src/auth/rbac.js`.

### Comandos de Generación:

```bash
# Regenerar toda la documentación técnica:
npm run docs:gen

# Verificar sincronización (CI ejecuta este check):
npm run docs:gen:check
```

> ⚠️ **Bloqueo en CI:** Cualquier PR que modifique endpoints, modelos o permisos sin regenerar la documentación fallará automáticamente en CI con `docs:gen:check`.

---

## 4. Historial de Cambios (Keep a Changelog + SemVer)

Todo cambio notable debe reflejarse en:
- `website/docs/historial-cambios.md`
- `CHANGELOG.md`

Siguiendo el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y versionado semántico [SemVer](https://semver.org/lang/es/):
- `Added`: para nuevas funciones.
- `Changed`: para cambios en funcionalidades existentes.
- `Deprecated`: para características que pronto serán eliminadas.
- `Removed`: para características eliminadas.
- `Fixed`: para corrección de bugs.
- `Security`: para correcciones de vulnerabilidades.

---

## 5. Validación Local y Pre-PR Checklist

Antes de enviar un Pull Request, asegúrate de que todos los checks pasen en local:

```bash
# 1. Regenerar y verificar sincronización de documentación
npm run docs:gen:check

# 2. Validar que Docusaurus compile sin enlaces rotos (onBrokenLinks: throw)
npm run docs:build

# 3. Ejecutar suite de pruebas de backend
pytest backend/tests/test_master_suite.py

# 4. Validar compilación del frontend
cd frontend && npm run build
```
