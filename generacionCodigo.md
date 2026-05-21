# SPEC MAESTRO — Desarrollo de Código (Backend + Frontend)

> **Versión:** 2.0 (Actualizado a la Arquitectura Real de 15 Módulos)
> **Propósito:** Spec único y actualizado para modificar, agregar o refactorizar componentes de backend y frontend en la Plataforma MEH, siguiendo el estándar BMAD (Happy Path / Sad Paths / Reglas de Negocio / Criterios de Aceptación).
> **Archivo maestro:** Este documento. Consérvalo en la raíz como la guía definitiva de desarrollo conjunto.

---

## 1. Stack y Restricciones Técnicas Absolutas

Para mantener la consistencia con la base de código actual y evitar conflictos de tipos y asincronía, **nunca** asumas tecnologías modernas o genéricas. Debes ceñirte estrictamente a estas reglas:

| Aspecto | Tecnología Real del Proyecto | Restricción / Prohibición |
|---|---|---|
| **Backend** | FastAPI síncrono | **Prohibido** usar `async def` en routers o endpoints a menos que sea middleware. |
| **ORM** | SQLAlchemy síncrono | **Prohibido** usar `AsyncSession` o `async with db`. Usa `db.commit()`, `db.rollback()`. |
| **PKs de Tablas** | `INTEGER` autoincremental (`SERIAL`) | **Prohibido** usar UUID o UUIDv4 como llaves primarias en los modelos. Todas las llaves primarias (`PK`) son de tipo entero secuencial autoincremental. |
| **UUIDs en el sistema** | `sa.String()` / `VARCHAR` | El único UUID es `uuid_verificacion` en `certificados`. **No** usa el tipo nativo `UUID` de PostgreSQL; se guarda como un `sa.String()` (texto) y su valor por defecto se genera con la función estándar `str(uuid.uuid4())` de Python. |
| **Autenticación** | JWT HS256 (python-jose + passlib) | **Prohibido** OAuth2 complejo, Auth0 o Supabase. |
| **Roles (RBAC)** | Jerarquía estricta en base de datos | `ADMIN` > `ORGANIZADOR` > `MODERADOR` > `SOPORTE` > `EMBAJADOR` > `MIEMBRO`. |
| **Frontend** | React 18 (`.jsx` estándar) | **Prohibido** usar TypeScript (`.tsx` o interfaces TS) o clases obsoletas. |
| **UI Styling** | Fluent UI v9 (`@fluentui/react-components`) | **Prohibido** Tailwind CSS, Material UI o Bootstrap a menos que se pida explícitamente. |
| **Enrutamiento** | React Router v6 | Uso de layouts protegidos y guardias de ruta en frontend. |
| **Estado Frontend** | Context API y Hooks personalizados | `AuthContext` (JWT), `ThemeContext` (Modo Oscuro persistente). |
| **Llamadas API** | Axios con interceptores | Instancia centralizada en `services/api.js`. |
| **Base de Datos** | PostgreSQL (psycopg2) | Servidor de base de datos relacional. |
| **Migraciones** | Alembic | El historial completo de base de datos consta de 11 revisiones. |

---

## 2. Catálogo de los 15 Módulos del Sistema

Cualquier cambio o adición de código debe mapearse y encajar perfectamente en uno de los 15 módulos existentes de la Plataforma:

| # | Módulo | Routers (`api/`) | Servicios (`services/`) | Schemas (`schemas/`) | Modelos de Datos (`models.py`) |
|---|---|---|---|---|---|
| **1** | **Auth / Identidad** | `auth.py` | `auth_service.py` | `user.py` | `Usuario` (Roles, preferencias, redes sociales) |
| **2** | **Eventos** | `eventos.py` | `eventos_service.py`, `ecosistema_service.py` | `evento.py`, `ecosistema.py` | `Evento`, `Speaker`, `Auspiciador` |
| **3** | **Inscripción y Asistencia** | `inscripciones.py`, `asistencia.py` | `inscripciones_service.py`, `asistencia_service.py` | `inscripcion.py`, `checkpoint.py` | `InscripcionEvento`, `Checkpoint`, `AsistenciaDetalle`, `ComunidadAliada` |
| **4** | **Learning Hub (LMS)** | `cursos.py`, `learning_path.py` | `cursos_service.py` | `curso.py` | `Curso`, `Leccion`, `Tarea`, `EntregaTarea`, `PostForo`, `InscripcionCurso` |
| **5** | **Gamificación** | `badges.py` | `badge_service.py` | `badge.py` | `Badge`, `UsuarioBadge` (Logros y puntos) |
| **6** | **Certificados** | `certificados_admin.py` | `certificado_generator_service.py` | `certificado.py` | `Certificado` (UUID, códigos criptográficos de validación) |
| **7** | **Pagos / OCRM** | `pagos.py` | `pagos_service.py`, `ocrm_service.py` | `pago.py` | `Pago` (Validación de comprobante y porcentaje OCR) |
| **8** | **Souvenirs (Tienda)** | `souvenirs.py` | `souvenirs_service.py` | `producto.py` | `Producto`, `Pedido`, `PedidoDetalle` (Stock y Kits) |
| **9** | **Academia** | `academia.py` | `academia_service.py` | (Reusa curso) | (Gestión integrada de aulas y rutas de aprendizaje) |
| **10** | **Recursos** | `recursos.py` | `recurso_service.py` | `recurso.py` | `Recurso` (Descarga de archivos y manuales markdown) |
| **11** | **Anuncios** | (Integrado) | (Integrado) | `anuncio.py` | `Anuncio` (Mensajes globales en el dashboard) |
| **12** | **Dashboard / Reportes** | `dashboard.py`, `reports.py` | `dashboard_service.py` | (Queries) | (Agregaciones y estadísticas financieras/académicas) |
| **13** | **Logs de Auditoría** | `logs.py` | `logs_service.py` | (Auditoría) | `LogSistema` (Historial de cambios de administradores) |
| **14** | **Admin / Config** | `admin_directories.py` | (Directorio) | (Global) | `ConfiguracionGlobal` (Configuraciones dinámicas) |
| **15** | **Files (Gestión)** | `files.py` | (Uploads) | (Multipart) | (Servicio y montaje de archivos estáticos y uploads) |

---

## 3. Estructura de Carpetas del Proyecto

### Backend (`backend/app/`)
* **`models/models.py`**: **ÚNICO ARCHIVO DE MODELOS**. No crees archivos de modelos separados. Todas las clases SQLAlchemy deben estar declaradas aquí heredando de `Base` y `AuditMixin` (cuando aplique auditoría).
* **`schemas/`**: Esquemas de Pydantic para validación y serialización de datos de entrada/salida.
* **`api/`**: Routers de FastAPI con endpoints que delegan la lógica de negocio a los servicios.
* **`services/`**: Lógica de negocio pura. Recibe la sesión de base de datos (`db: Session`) y realiza consultas y transacciones síncronas.
* **`core/`**: Configuraciones críticas del sistema (seguridad, autenticación, excepciones globales, envío de correos).

### Frontend (`frontend/src/`)
* **`pages/`**: Vistas de páginas React estructuradas en PascalCase (e.g. `Dashboard.jsx`, `EventsMaster.jsx`).
* **`components/`**: Componentes visuales reutilizables. Carpetas separadas por contexto (`layout/`, `ui/`).
* **`hooks/`**: Custom hooks encapsulando lógica de estado reactivo.
* **`services/`**: Módulos JavaScript para llamadas HTTP con Axios (e.g. `authService.js`, `eventoService.js`).
* **`auth/rbac.js`**: Definición jerárquica de permisos y validaciones de sesión.

---

## 4. Convenciones de Código y Arquitectura

### Backend
1. **Nombres de Modelos:** PascalCase singular (`Usuario`, `InscripcionEvento`).
2. **Nombres de Tablas:** snake_case plural (`usuarios`, `inscripciones_eventos`).
3. **Nombres de Columnas:** snake_case (`id_usuario`, `fecha_creacion`).
4. **Inyección de DB:** Utiliza la dependencia síncrona `db: Session = Depends(get_db)`.
5. **Auditoría:** Las tablas que representan entidades principales deben heredar de `AuditMixin` (proporciona `creado_por`, `fecha_creacion`, `modificado_por`, `fecha_modificacion`).
6. **Manejo de Errores:** Lanza excepciones personalizadas desde `core.exceptions` (ej. `RecursoNoEncontradoError`, `ErrorNegocio`). El `global_exception_handler` se encargará de traducirlas a códigos HTTP adecuados.

### Frontend
1. **Nombres de Archivos:** PascalCase para componentes e índices (`Sidebar.jsx`), camelCase para hooks y servicios (`authService.js`).
2. **Estilos:** Prioriza tokens de Fluent UI (`makeStyles`, `shorthands`) para un diseño Microsoft nativo limpio y consistente.
3. **Control de Nulos:** Utiliza encadenamiento opcional (`data?.property`) antes de mapear colecciones para evitar pantallas en blanco (White Screen of Death).

---

## 5. Patrón de Desarrollo BMAD

Cada funcionalidad o refactorización que desarrollemos juntos debe seguir estrictamente este protocolo estructurado para garantizar robustez:

### A. Happy Path
Describe el flujo de éxito ideal. Qué datos entran, qué procesos ocurren y qué respuesta perfecta se le da al usuario.

### B. Sad Paths (Caminos de Error)
Mapea todos los posibles escenarios de falla y cómo debe responder el sistema:
* Registros duplicados -> HTTP 400 Bad Request.
* IDs inexistentes -> HTTP 404 Not Found.
* Sin autorización -> HTTP 403 Forbidden.
* Errores de cálculo financieros/académicos -> Control de excepciones limpio.

### C. Reglas de Negocio (RN)
Lista de condiciones obligatorias que gobiernan el flujo. Por ejemplo:
* *RN-001:* Un miembro no puede obtener una certificación si su progreso en el curso es menor al 100%.
* *RN-002:* Un pago validado por OCR debe cruzar el código de referencia antes de ser aprobado automáticamente.

### D. Criterios de Aceptación (CA)
Checklist detallado de validación técnica para backend, frontend y pruebas unitarias/integración.

---

## 6. Flujo de Trabajo en Pareja (Tú y Yo)

Cuando me solicites una tarea o código:
1. **Identificaremos el Módulo:** Verificaremos en cuál de los 15 módulos impacta el cambio.
2. **Diseñaremos el BMAD:** Definiremos brevemente el Happy Path, Sad Paths y Reglas de Negocio aplicables.
3. **Escribiremos Código Coherente:**
   * Backend: Lógica síncrona, modelos en `models.py`, schemas dedicados, servicios robustos y routers limpios.
   * Frontend: JSX Fluent UI v9 reactivo, manejo seguro de estados y control de nulos.
4. **Actualizaremos la Documentación:** Los specs de características nuevas se colocarán en `specs/` y el portal interactivo de Docusaurus (`website/docs/`) se mantendrá sincronizado.
