\# SPEC MAESTRO — Desarrollo de Código (Backend + Frontend)

> \*\*Versión:\*\* 1.0

> \*\*Propósito:\*\* Spec único para modificar, agregar o refactorizar componentes de backend y frontend en Plataforma MEH, siguiendo BMAD (Happy Path / Sad Paths / Reglas de Negocio / Criterios de Aceptación).

> \*\*Archivo maestro:\*\* Este documento. Léelo completo al inicio de la sesión. No es necesario volver a leerlo en cada cambio.

\---

\## 1. Stack y Restricciones Técnicas

NO asumas tecnologías modernas. Usa estas:

| Aspecto | Realidad |

|---|---|

| Backend | FastAPI síncrono (sin `async def` en routers) |

| ORM | SQLAlchemy síncrono (sin async session) |

| PK | INTEGER autoincrement (SERIAL), NO UUID |

| Autenticación | JWT HS256 con python-jose + passlib/bcrypt |

| Roles | RBAC jerárquico: ADMIN > ORGANIZADOR > MODERADOR > SOPORTE > EMBAJADOR > MIEMBRO |

| Frontend | React 18, .jsx (NO .tsx) |

| UI | Fluent UI v9 (`@fluentui/react-components`) |

| Routing | React Router v6 |

| Estado | Context API (AuthContext, ThemeContext, NotificationContext) |

| API calls | Axios con interceptors (`services/api.js`) |

| BD | PostgreSQL con psycopg2 |

| Migraciones | Alembic |

| Tests | Vitest + Testing Library (frontend) |

| Despliegue | Render (backend) + Vercel (frontend) |

\---

\## 2. Estructura del Proyecto (Dónde va cada cosa)

\### Backend (`backend/app/`)

| Capa | Carpeta | Archivo | Propósito |

|---|---|---|---|

| Modelo | `models/` | `models.py` | \*\*UN SOLO ARCHIVO\*\* con todas las tablas SQLAlchemy. NO crear models separados. |

| Esquema | `schemas/` | `\[nombre].py` | Un archivo por módulo. Schemas Pydantic de entrada/salida. |

| Router | `api/` | `\[nombre].py` | Un archivo por módulo. Rutas FastAPI con `router = APIRouter()`. |

| Servicio | `services/` | `\[nombre]\_service.py` | Lógica de negocio. Recibe `db: Session` y schemas. |

| Core | `core/` | `auth.py`, `permissions.py`, `exceptions.py`, `logging.py`, `email\_config.py` | Configuración transversal. |

\*\*Reglas:\*\*

\- NO crear nuevos archivos en `core/` a menos que sea estrictamente necesario.

\- Los routers NO deben contener lógica de negocio. Solo validación y llamado a servicios.

\- Todos los modelos van en `models.py`.

\- Las migraciones se generan con `alembic revision --autogenerate`.

\### Frontend (`frontend/src/`)

| Capa | Carpeta | Propósito |

|---|---|---|

| Páginas | `pages/` | Una página por ruta. Nombre en PascalCase: `Login.jsx`, `EventsMaster.jsx` |

| Componentes | `components/` | Componentes reutilizables. Subcarpetas por tipo (`layout/`, `ui/`). |

| Hooks | `hooks/` | Custom hooks. Subcarpeta por módulo (`admin/`). |

| Servicios | `services/` | Llamadas a la API. Una función por endpoint. Usa `api.js` como instancia Axios. |

| Auth | `auth/` | `rbac.js` con roles, permisos y funciones de validación. |

| Utilidades | `utils/` | `validators.js`, `constants.js`. |

| Tema | `theme/` | `theme.js` con temas claro/oscuro para Fluent UI. |

\*\*Reglas:\*\*

\- NO usar TypeScript. Archivos `.jsx`.

\- Los servicios deben importar `api` desde `services/api.js`.

\- Los componentes reutilizables van en `components/`, no en `pages/`.

\- Las rutas se definen en `App.jsx`.

\---

\## 3. Convenciones de Código

\### Backend

| Aspecto | Convención |

|---|---|

| Nombres de modelos | PascalCase singular: `Usuario`, `Evento`, `InscripcionEvento` |

| Nombres de tablas | snake\_case plural: `usuarios`, `eventos`, `inscripciones\_eventos` |

| Nombres de columnas | snake\_case: `id\_usuario`, `fecha\_creacion` |

| Nombres de schemas | PascalCase con sufijo: `UserCreate`, `UserResponse`, `EventoCreate` |

| Nombres de routers | snake\_case: `auth.py`, `eventos.py` |

| Nombres de servicios | snake\_case con `\_service`: `auth\_service.py`, `eventos\_service.py` |

| PK | Siempre `id\_\[tabla]` de tipo Integer con `primary\_key=True, index=True` |

| AuditMixin | Siempre heredar de `AuditMixin` en tablas principales |

| Inyección de BD | Usar `get\_db` como dependencia: `db: Session = Depends(get\_db)` |

| Manejo de errores | Usar excepciones de `core/exceptions.py`: `RecursoNoEncontradoError`, `PermisoDenegadoError`, `ErrorNegocio` |

| Permisos | Usar decoradores de `core/permissions.py`: `ensure\_permission()`, `ensure\_roles()` |

\### Frontend

| Aspecto | Convención |

|---|---|

| Nombres de páginas | PascalCase + sufijo de página: `Login.jsx`, `EventsMaster.jsx` |

| Nombres de componentes | PascalCase: `Sidebar.jsx`, `UserProfileModal.jsx` |

| Nombres de hooks | camelCase con prefijo `use`: `useEventsManager.js`, `useAcademyManager.js` |

| Nombres de servicios | camelCase: `eventoService.js`, `authService.js` |

| Nombres de funciones en servicios | camelCase: `getEvents()`, `createEvent()` |

| Nombres de rutas | kebab-case: `/dashboard/events-master`, `/gestion-pagos` |

| Estado global | Context API: `useAuth()`, `useTheme()`, `useNotify()` |

| Estilos | Fluent UI tokens + className cuando sea necesario |

| Llamadas API | Axios instance desde `services/api.js` con interceptors de token |

\---

\## 4. Patrón BMAD para cada Feature

Cada vez que se te solicite agregar o modificar una funcionalidad, debes definir:

\### 4.1. Happy Path

El flujo ideal donde todo funciona correctamente. Ejemplo:

> \*\*Happy Path — Inscripción a evento:\*\* El usuario selecciona un evento con cupos disponibles, elige método de pago gratuito, el sistema genera un QR único, registra la inscripción con estado CONFIRMADO, y devuelve el código QR.

\### 4.2. Sad Paths

Todos los flujos alternos donde algo falla:

| Sad Path | Causa | HTTP Status | Mensaje |

|---|---|---|---|

| Evento lleno | capacidad\_max alcanzada | 400 | "El evento está lleno" |

| Usuario ya inscrito | ya existe inscripción | 400 | "Ya estás inscrito a este evento" |

| Evento no existe | id\_evento inválido | 404 | "Evento no encontrado" |

| Sin permisos | rol no tiene acceso | 403 | "No tienes permisos para inscribirte" |

\### 4.3. Reglas de Negocio

| ID | Regla | ¿Dónde se valida? |

|---|---|---|

| RN-001 | Un usuario no puede inscribirse dos veces al mismo evento | Service layer |

| RN-002 | La inscripción solo es posible si `capacidad\_max > inscripciones\_actuales` | Service layer |

| RN-003 | El QR se genera automáticamente al confirmar la inscripción | Service layer + Model |

| RN-004 | Si el evento es gratuito, la inscripción pasa a CONFIRMADO automáticamente | Service layer |

\### 4.4. Criterios de Aceptación

\- \[ ] El endpoint `POST /api/v1/inscripciones` rechaza inscripciones duplicadas

\- \[ ] El endpoint `POST /api/v1/inscripciones` rechaza cuando el evento está lleno

\- \[ ] El QR se genera como uuid4 y se almacena en `codigo\_qr`

\- \[ ] El frontend muestra mensaje de error claro en cada Sad Path

\---

\## 5. Template para Agregar una Nueva Funcionalidad

Cuando se te pida una nueva feature, debes generar/cambiar estos archivos en orden:

\### Backend

1\. \*\*Modelo\*\* (`models.py`): Agregar o modificar la clase SQLAlchemy. Incluir AuditMixin si es tabla principal.

2\. \*\*Migración\*\*: Ejecutar `alembic revision --autogenerate -m "descripcion"` y revisar el archivo generado.

3\. \*\*Schema\*\* (`schemas/\[nombre].py`): Crear o modificar los Pydantic models (Base, Create, Update, Response).

4\. \*\*Servicio\*\* (`services/\[nombre]\_service.py`): Lógica de negocio con Happy Path + Sad Paths. NO lógica de presentación.

5\. \*\*Router\*\* (`api/\[nombre].py`): Endpoints con validación Pydantic, permisos, y llamado a servicio.

6\. \*\*Registrar router\*\* en `main.py` si es nuevo: `app.include\_router(\[nombre].router, prefix="/api/v1/\[nombre]")`

\### Frontend

7\. \*\*Servicio API\*\* (`services/\[nombre]Service.js`): Función que llama al endpoint con Axios.

8\. \*\*Página\*\* (`pages/\[Nombre].jsx`): Componente principal con formulario/tabla.

9\. \*\*Ruta\*\* en `App.jsx`: Agregar `<Route path="..." element={<ProtectedRoute><Nombre /></ProtectedRoute>} />`

10\. \*\*Sidebar\*\* en `components/Sidebar.jsx` si la página necesita acceso desde el menú.

\---

\## 6. Órdenes de Activación

\### Para una feature nueva completa:

> "Ejecuta el spec de código. Necesito una nueva funcionalidad: \*\*\[descripción breve]\*\*. Happy path: \*\*\[qué debería pasar cuando todo funciona]\*\*. Sad paths: \*\*\[lista de casos de error]\*\*. Reglas de negocio: \*\*\[lista de reglas]\*\*. Genera modelo, migración, schema, servicio, router, frontend page, ruta y sidebar. No crees archivos .md."

\### Para modificar algo existente:

> "Ejecuta el spec de código. En \*\*\[archivo]\*\*, necesito \*\*\[qué cambiar]\*\*. Happy path: \*\*\[cómo debería funcionar después del cambio]\*\*. Sad paths: \*\*\[qué debería fallar]\*\*. Solo modifica lo necesario, no toques el resto."

\### Para agregar solo backend:

> "Ejecuta el spec de código. Solo backend. Necesito un nuevo endpoint \*\*\[METHOD] /api/v1/\[ruta]\*\* que \*\*\[descripción]\*\*. Schema: \*\*\[campos]\*\*. Happy path / Sad paths: \*\*\[lista]\*\*. No toques frontend."

\### Para agregar solo frontend:

> "Ejecuta el spec de código. Solo frontend. Necesito una nueva página en \*\*\[ruta]\*\* que muestre \*\*\[descripción]\*\*. Debe conectar con el endpoint \*\*\[endpoint existente]\*\*. Usa Fluent UI, tabla con datos, y manejo de errores. No toques backend."

\---

\## 7. Lo que NO debe hacer este spec

\- ❌ NO generar archivos .md de documentación

\- ❌ NO tocar `docs/tecnico/` ni `docs/usuario/`

\- ❌ NO asumir UUID, async, TypeScript

\- ❌ NO crear modelos en archivos separados (todo va en `models.py`)

\- ❌ NO modificar `core/` archivos sin autorización explícita

\- ❌ NO eliminar funcionalidades existentes a menos que se solicite

