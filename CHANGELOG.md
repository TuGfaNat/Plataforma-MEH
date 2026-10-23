# Changelog (Historial de Cambios)

Todas las modificaciones notables realizadas en Plataforma MEH se documentan en este archivo.

El formato se basa estrictamente en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto se rige por [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [Unreleased]
### Added
- **MEH-020:** Panel de limpieza selectiva de datos (Soft/Hard Delete) con trazabilidad de origen (`SEED`, `REAL`, `OCR`), cuentas protegidas (`SUPERADMIN_EMAIL`, usuario actual y lista blanca configurable), presets configurables (incluido *"Dejar solo superadmin"*), respaldo JSON obligatorio fuera de `/static` con TTL de 30 minutos, verificación criptográfica `selection_hash`, confirmación progresiva (frase + contraseña + motivo) y auditoría forense persistente en `logs_sistema`.
- Pipeline Docs-as-Code con generador unificado en `tools/docs_gen.py`.
- Soporte de subcomandos `tech`, `user`, `changelog`, `all` y `check`.
- Doble superficie de despliegue híbrido consistente (GitHub Pages en `/` y Docker en `/docs/`).
- Validaciones en CI para prevenir desincronización de documentación ante cambios en endpoints o esquemas.

### Changed
- Reutilización de `auth_service.restaurar_usuario` en Papelera (`/api/admin/trash/restore`) para reactivar `activo = True` y limpiar `motivo_suspension` al restaurar usuarios o entidades borradas lógicamente.
- Soporte de `commit=False` y serialización extendida en `registrar_log` para transacciones atómicas de limpieza.
- Reestructuración de Docusaurus en 4 bloques según la taxonomía Diátaxis (Tutoriales, Guías Prácticas, Referencia, Explicación).
- Normalización de rutas y slugs eliminando prefijos numéricos obsoletos.

### Removed
- Eliminación de scripts huérfanos generadores en la raíz (`build_docs.py`, `build_user_manual.py`, `generate_tech_docs.py`).

---

## [1.2.0] - 2026-05-25
### Added
- Integración de la matriz RBAC jerárquica completa y validaciones en frontend y backend.
- Diagramas de secuencia Mermaid para escaneo QR de asistencia.
- Soporte de certificados académicos y modo offline en lector QR con IndexedDB.

### Changed
- Refactorización de componentes en Fluent UI v9 y Griffel.
- Optimización de índices en base de datos PostgreSQL con `INTEGER SERIAL`.

---

## [1.1.0] - 2026-05-25
### Added
- Módulo de finanzas y conciliación bancaria difusa con OCR determinístico y similitud Jaro-Winkler.
- Sistema de Insignias digitales interoperables con el estándar Open Badges.

---

## [1.0.0] - 2026-05-19
### Added
- Lanzamiento inicial de la Plataforma Microsoft Education Hub (MEH).
- Módulos de autenticación JWT HS256, eventos, cursos (LMS) y souvenirs.
- Arquitectura de Monolito Modular Síncrono con FastAPI y SQLAlchemy.
