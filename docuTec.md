# SPEC MAESTRO — Documentación Técnica de Plataforma MEH

> **Versión:** 4.0 (Definitiva)
> **Propósito:** Spec único para la generación COMPLETA de la documentación técnica del sistema Microsoft Education Hub (Plataforma MEH) en UNA SOLA EJECUCIÓN.
> **Ubicación:** `F:\Plataforma-MEH\website\docs\tecnico\`
> **Archivo maestro:** Este documento. Léelo completo antes de cualquier acción.

---

## ⚠️ ADVERTENCIA CRÍTICA — RESTRICCIONES TÉCNICAS

Este proyecto usa las siguientes tecnologías específicas. NO asumas versiones modernas por defecto:
| Aspecto | Realidad del código | NO uses |
|---|---|---|
| PK de tablas | **INTEGER SERIAL** (autoincrement) | UUID, UUIDv4, `uuid_generate_v4()` |
| ORM | **SQLAlchemy síncrono** (`session.commit()`, `session.execute()`) | async/await, AsyncSession, `async with session` |
| Frontend | **.jsx** (JavaScript, no TypeScript) | .tsx, TypeScript, interfaces TS |
| Componentes UI | **Fluent UI v9** (`@fluentui/react-components`) | Material UI, Ant Design, Chakra |
| Backend | **FastAPI síncrono** en routers (sin `async def` a menos que exista) | `async def` en cada endpoint automáticamente |
| JWT | **python-jose** con **HS256** | OAuth2 complejo, Auth0, Supabase Auth |
**Si generas documentación con UUID, async, .tsx, o tecnologías que no están en este proyecto, será rechazada.**

---

## 1. Misión y Contexto

Actúas como un **Ingeniero de Software Senior** y **Arquitecto de Sistemas**. Tu misión es realizar ingeniería inversa exhaustiva del código fuente de **Plataforma MEH** para generar y mantener la documentación técnica COMPLETA del sistema.
Tienes **control total** sobre `F:\Plataforma-MEH\website\docs\tecnico\`. Puedes **crear, editar, eliminar y reestructurar** archivos y carpetas. No estás limitado a una estructura preexistente.
**Conveniencia:** El manual de usuario vive en `docs\usuario\`. No toques archivos fuera de `docs\tecnico\` a menos que sea para leer contexto.

### Stack Tecnológico Real

- **Backend:** FastAPI (Python 3.11) + SQLAlchemy síncrono + PostgreSQL + Alembic + Instrumentador Prometheus
- **Frontend:** React 18 + Fluent UI v9 + Vite + react-i18next + Recharts + jsPDF
- **Seguridad:** JWT HS256 (python-jose) + passlib/bcrypt + RBAC jerárquico + AuditMixin
- **Monitoreo y Carga:** Prometheus + Grafana + k6 (Docker Compose)
- **Documentación:** Docusaurus
- **Despliegue:** Render (backend gunicorn+uvicorn) + Vercel (frontend)

### Reglas de Redacción

- **Densidad absoluta:** prohibido resumir o simplificar.
- **Rigor académico:** estilo IEEE/ACM.
- **Normativa APA 7:** tablas solo con líneas horizontales. Diagramas en Mermaid.
- **Prohibido alucinar:** usa `[NO ENCONTRADO EN EL CÓDIGO FUENTE]` si algo no existe.
- **Frontmatter Docusaurus:** `--- id, title, sidebar_position ---`.
- **Tipos reales:** INTEGER, VARCHAR, TIMESTAMP, BOOLEAN, NUMERIC(10,2), TEXT — los que están en `models.py`.

---

## 2. LECTURA OBLIGATORIA PREVIA

Antes de generar CUALQUIER contenido, debes leer:

1. **`docuTec.md`** (raíz del repo) — documentación técnica previa (~20KB)
2. **`docUser.md`** (raíz) — documentación de usuario previa (~16KB)
3. **`DOCUMENTACION_TESIS.md`** (raíz) — contexto de tesis
4. **`specs/*.md`** — specs de features existentes (certificados)
5. **`generate_tech_docs.py`** (raíz) — script de extracción automática
6. **`backend/app/models/models.py`** — modelo completo de datos
7. **`backend/app/core/permissions.py`** — roles y permisos exactos
8. **`backend/app/core/auth.py`** — configuración JWT exacta
   Extrae TODO el contenido relevante de esos archivos. No los ignores. Si un dato documental contradice al código actual, márcalo como `[DESACTUALIZADO]`.

---

## 3. Escenarios de Activación

| Si el usuario dice...                                     | Significa...                                                                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Genera toda la documentación técnica desde cero"**     | Generar ABSOLUTAMENTE TODO: visión general, mapa de dependencias, ADRs globales, los 15 módulos (M0-M6), apéndices, e historial de cambios. Un solo pase. |
| "Activa la documentación para el módulo de **[Nombre]** " | Generar solo ese módulo.                                                                                                                                  |
| "Actualiza la documentación del módulo **[Nombre]** "     | Leer doc existente, leer código, actualizar solo diferencias.                                                                                             |
| "Agregué un nuevo módulo **[Nombre]** "                   | Buscar nueva carpeta/router/service y generar doc.                                                                                                        |
| "Elimina la documentación del módulo **[Nombre]** "       | Eliminar archivo y actualizar índices.                                                                                                                    |

---

## 4. Flujo de Mantenimiento

Para cualquier escenario:

1. Leer este spec.
2. Leer documentos obligatorios (sección 2).
3. Leer el código fuente real (backend api/services/models/schemas/core, frontend pages/components/hooks/services, migraciones).
4. Comparar doc vs código.
5. Ejecutar la acción (generar/actualizar/eliminar).
6. Actualizar `docs/tecnico/06-historial-cambios.md`.

---

## 5. Estructura Global a Generar

docs/tecnico/
├── index.md
├── 01-vision-general/
│ ├── index.md
│ ├── 01-proposito-y-alcance.md
│ ├── 02-stack-tecnologico.md
│ ├── 03-diagrama-c4-contexto.md
│ └── 04-diagrama-c4-contenedores.md
├── 02-mapa-dependencias/
│ ├── index.md
│ └── 01-grafo-dependencias.md
├── 03-decisiones-arquitectonicas/
│ ├── index.md
│ ├── 01-adr-global-001-framework.md
│ ├── 02-adr-global-002-base-de-datos.md
│ ├── 03-adr-global-003-autenticacion.md
│ └── 04-adr-global-004-async-vs-sync.md
├── 04-modulos/
│ ├── index.md
│ ├── 01-auth-identidad.md
│ ├── 02-eventos.md
│ ├── 03-inscripciones-asistencia.md
│ ├── 04-learning-hub-cursos.md
│ ├── 05-gamificacion-badges.md
│ ├── 06-certificados.md
│ ├── 07-pagos-ocrn.md
│ ├── 08-productos-souvenirs.md
│ ├── 09-academia.md
│ ├── 10-recursos.md
│ ├── 11-anuncios.md
│ ├── 12-dashboard-reportes.md
│ ├── 13-logs-auditoria.md
│ ├── 14-admin-configuracion.md
│ └── 15-files.md
├── 05-apendices/
│ ├── index.md
│ ├── 01-migraciones-completas.md
│ ├── 02-guia-despliegue.md
│ └── 03-seguridad-headers-cors.md
└── 06-historial-cambios.md

---

## 6. Template Modular (aplicar a cada módulo y a las secciones globales)

### Sección M0 — ADR Local

Tabla APA 7 con: ID, Decisión, Alternativas, Justificación, Consecuencias.

### Sección M1 — Arquitectura (C4 Nivel 3 + Ciclo de Vida)

Diagrama C4 + Diagrama de Secuencia Mermaid + ciclo de vida de petición.

### Sección M2 — Diccionario de Datos

Diagrama ER Mermaid + tabla APA 7 por cada columna con tipos REALES (INTEGER, VARCHAR, TIMESTAMP, etc.).

### Sección M3 — Contratos de APIs

Tabla con método, URI, payload, response, excepciones + Schemas Pydantic con tipos exactos + headers.

### Sección M4 — Ingeniería Avanzada

AuditMixin, RBAC jerárquico, algoritmos específicos (OCRM, QR, badges, certificados).

### Sección M5 — Frontend

Ruta, componente principal, árbol Mermaid, estado, conexión con backend, estilos, i18n, qué hace y qué no.

### Sección M6 — Migraciones

## Lista de migraciones de Alembic que afectan al módulo.

## 7. Catálogo de los 15 Módulos (con rutas exactas)

| #   | Módulo                     | Routers                             | Services                                                                     | Schemas                           | Modelos                                                                     |
| --- | -------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| 1   | Auth / Identidad           | `auth.py`                           | `auth_service.py`, `core/auth.py`, `core/permissions.py`                     | `user.py`                         | `Usuario`                                                                   |
| 2   | Eventos                    | `eventos.py`                        | `eventos_service.py`                                                         | `evento.py`, `ecosistema.py`      | `Evento`, `Speaker`, `Auspiciador`                                          |
| 3   | Inscripciones y Asistencia | `inscripciones.py`, `asistencia.py` | `inscripciones_service.py`, `asistencia_service.py`, `ecosistema_service.py` | `inscripcion.py`, `checkpoint.py` | `InscripcionEvento`, `Checkpoint`, `AsistenciaDetalle`, `ComunidadAliada`   |
| 4   | Learning Hub (Cursos)      | `cursos.py`, `learning_path.py`     | `cursos_service.py`                                                          | `curso.py`                        | `Curso`, `Leccion`, `Tarea`, `EntregaTarea`, `PostForo`, `InscripcionCurso` |
| 5   | Gamificación (Badges)      | `badges.py`                         | `badge_service.py`                                                           | `badge.py`                        | `Badge`, `UsuarioBadge`                                                     |
| 6   | Certificados               | `certificados_admin.py`             | `certificado_generator_service.py`                                           | `certificado.py`                  | `Certificado`                                                               |
| 7   | Pagos / OCRM               | `pagos.py`                          | `pagos_service.py`, `ocrm_service.py`                                        | `pago.py`                         | `Pago`                                                                      |
| 8   | Souvenirs / Productos      | `souvenirs.py`                      | `souvenirs_service.py`                                                       | `producto.py`                     | `Producto`, `Pedido`, `PedidoDetalle`                                       |
| 9   | Academia                   | `academia.py`                       | `academia_service.py`                                                        | —                                 | (reusa `Curso`, `InscripcionCurso`)                                         |
| 10  | Recursos                   | `recursos.py`                       | `recurso_service.py`                                                         | `recurso.py`                      | `Recurso`                                                                   |
| 11  | Anuncios                   | —                                   | —                                                                            | `anuncio.py`                      | `Anuncio`                                                                   |
| 12  | Dashboard / Reportes       | `dashboard.py`, `reports.py`        | `dashboard_service.py`                                                       | —                                 | (queries agregadas)                                                         |
| 13  | Logs / Auditoría           | `logs.py`                           | `logs_service.py`                                                            | —                                 | `LogSistema`                                                                |
| 14  | Admin / Configuración      | `admin_directories.py`              | —                                                                            | —                                 | `ConfiguracionGlobal`                                                       |
| 15  | Files / Archivos           | `files.py`                           | —                                                                            | —                                 | (subida de archivos)                                                        |
| 16  | Monitoreo y Pruebas Carga  | —                                   | `prometheus_fastapi_instrumentator`                                          | —                                 | Prometheus configuration, Grafana dashboards, k6 load testing scripts       |

### Sección M7 — Configuración de Monitoreo y Pruebas de Carga
*   **Prometheus Exporter:** Instrumentación síncrona en `backend/app/main.py` mediante `Instrumentator().instrument(app).expose(app)`. Expone la ruta de métricas `/metrics` en el puerto `8000`.
*   **Grafana Dashboard:** Configurado en Docker Compose mapeando el puerto `3001:3000`. Consume métricas recopiladas por Prometheus y expone latencias por endpoint, RPS, errores HTTP y pool de conexiones de base de datos.
*   **Pruebas de Carga (k6):** Script `tests/k6_load_test.js` parametrizado con 3 escenarios concurrentes (200 local, 1000 regional, 5000 global).

---

## 8. Sistema de Capturas

Cada vez que se requiera apoyo visual:
PUNTO DE INSERCIÓN MULTIMEDIA
Tipo: Diagrama ER / Secuencia / Arquitectura / Captura
Descripción: qué debe mostrar
Figura X. Título en cursiva
código Mermaid si aplica
Nota. Elaboración propia basada en el código fuente del software MEH.

---

## 9. Historial de Cambios

Mantener `docs/tecnico/06-historial-cambios.md` actualizado.
