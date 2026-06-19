# 🗺️ Guía y Mapa Arquitectónico del Sistema: Plataforma MEH

Esta guía sirve como un "torpedo" o hoja de ruta para tu **defensa de tesis**. Detalla exactamente dónde está instanciado, declarado y procesado cada componente clave en el frontend, backend y base de datos.

---

## 📂 Estructura General del Proyecto

El proyecto está dividido en dos partes principales (Monolito desacoplado):
1. **`backend/`**: Servidor en Python con FastAPI, SQLAlchemy (base de datos) y Pydantic (validaciones).
2. **`frontend/`**: Cliente SPA en React (Vite, Fluent UI de Microsoft, Axios).

---

## 🗄️ 1. Base de Datos y Modelos (ORM)

El sistema utiliza **SQLAlchemy** como ORM para mapear clases de Python a tablas SQL en PostgreSQL o SQLite.

### 📍 Puntos de Interés Clave:
* **Conexión e Instanciación**: [backend/app/database.py](file:///F:/Plataforma-MEH/backend/app/database.py)
  * `engine`: Instancia la conexión física al motor SQL.
  * `SessionLocal`: Fábrica de sesiones para interactuar con la base de datos.
  * `Base`: Clase base declarativa que heredan todos los modelos.
  * `get_db()`: Generador (yield) de sesiones utilizado como dependencia en los endpoints para asegurar el cierre automático de la conexión.
* **Declaración de Tablas (Modelos)**: [backend/app/models/models.py](file:///F:/Plataforma-MEH/backend/app/models/models.py)
  * Aquí están las clases/tablas: `Usuario`, `Curso`, `Leccion`, `Tarea`, `EntregaTarea`, `Insignia`, `Pago`, `RegistroAuditoria`, `Evento`, `Anuncio`, etc.
* **Logs Automáticos (Auditoría)**: [backend/app/models/mixins.py](file:///F:/Plataforma-MEH/backend/app/models/mixins.py)
  * `AuditMixin` y `EstadoLifecycleMixin`: Monitorean inserciones y actualizaciones e insertan de forma transparente registros en `RegistroAuditoria`.
* **Migraciones de Base de Datos**: Carpeta [backend/alembic/](file:///F:/Plataforma-MEH/backend/alembic/)
  * Usamos **Alembic** para manejar versiones de base de datos de manera incremental (ej. [add_event_payment_qrs](file:///F:/Plataforma-MEH/backend/alembic/versions/d2f530fc2803_add_event_payment_qrs.py)).

---

## 🐍 2. Backend (FASTAPI)

FastAPI estructura la lógica en tres capas: **API (Controladores/Endpoints)** -> **Services (Lógica de Negocio y Consultas)** -> **Schemas (Pydantic)**.

### 📍 Puntos de Interés Clave:
* **Punto de Entrada**: [backend/main.py](file:///F:/Plataforma-MEH/backend/main.py)
  * Inicializa `FastAPI()`, configura CORS (permite peticiones del frontend en puerto 5173), monta la carpeta estática para archivos y monta los routers.
* **Controladores y Rutas**: Carpeta [backend/app/api/](file:///F:/Plataforma-MEH/backend/app/api/)
  * `auth.py`: Rutas de registro, login y perfil.
  * `academia.py`: Rutas para lecciones, tareas, entregas y foros.
  * `cursos.py`: Rutas para cursos e instructores.
  * `eventos.py`: Rutas para creación de eventos y QR.
  * `pagos.py` y `badges.py`: Procesamiento de depósitos e insignias.
* **Servicios de Base de Datos (Consultas SQL)**: Carpeta [backend/app/services/](file:///F:/Plataforma-MEH/backend/app/services/)
  * Es la capa que escribe en base de datos (`db.add()`, `db.commit()`, `db.query()`).
  * Ejemplos: `cursos_service.py`, `eventos_service.py`, `auth_service.py`, `ocrm_service.py` (Procesamiento OCR).
* **Validación de Datos (Schemas)**: Carpeta [backend/app/schemas/](file:///F:/Plataforma-MEH/backend/app/schemas/)
  * Schemas de Pydantic que validan el cuerpo (JSON) que llega en los `POST` / `PUT` (ej. `curso.py`, `pago.py`).

---

## ⚛️ 3. Frontend (React & Fluent UI)

El frontend es una aplicación SPA (Single Page Application) montada con Vite.

### 📍 Puntos de Interés Clave:
* **Punto de Entrada**: [frontend/src/main.jsx](file:///F:/Plataforma-MEH/frontend/src/main.jsx)
  * Enlaza React al nodo DOM del HTML e inicializa la aplicación.
* **Enrutador y Protección de Rutas**: [frontend/src/App.jsx](file:///F:/Plataforma-MEH/frontend/src/App.jsx)
  * Instancia `BrowserRouter` de React Router.
  * `<ProtectedRoute allowedRoles={[...]}>`: Envoltura que intercepta las rutas y redirige a login o acceso denegado si el rol no coincide.
* **Cliente API (Axios)**: [frontend/src/services/api.js](file:///F:/Plataforma-MEH/frontend/src/services/api.js)
  * `api`: Cliente central de Axios.
  * **Interceptor de Peticiones**: Agrega la cabecera `Authorization: Bearer <TOKEN>` automáticamente si hay sesión.
  * **Interceptor de Respuestas**: Redirige a `/login` ante un error `401` (sesión expirada) o a `/acceso-denegado` ante un error `403`.
* **Sidebar e Navegación**: [frontend/src/components/Sidebar.jsx](file:///F:/Plataforma-MEH/frontend/src/components/Sidebar.jsx)
  * Genera el menú lateral evaluando los permisos del rol del usuario actual para mostrar u ocultar opciones dinámicamente.
* **Páginas Clave**: Carpeta [frontend/src/pages/](file:///F:/Plataforma-MEH/frontend/src/pages/)
  * `AdminPanel.jsx`: Contenedor principal de administración con tabs dinámicos.
  * `CursoAula.jsx`: Interfaz donde los estudiantes ven clases y suben sus trabajos.
  * `GestionPagos.jsx`: Panel de control de depósitos bancarios para validación.

---

## 🔑 4. Seguridad, Autenticación y RBAC

### 📍 Flujo de Autenticación (JWT):
1. El usuario envía credenciales a `POST /auth/login` (Backend).
2. El backend valida el alias/correo, firma un token **JWT (Json Web Token)** con una clave secreta (`SECRET_KEY`) y lo devuelve.
3. El frontend almacena el token en el `localStorage` mediante [authService.js](file:///F:/Plataforma-MEH/frontend/src/services/authService.js).
4. Para subsiguientes peticiones, el interceptor de [api.js](file:///F:/Plataforma-MEH/frontend/src/services/api.js) recupera el token del `localStorage` y lo adjunta en la cabecera de autorización.
5. El backend descodifica el token en `get_current_user` en [backend/app/api/auth.py](file:///F:/Plataforma-MEH/backend/app/api/auth.py) y extrae el usuario e inyecta su rol.

### 📍 Control de Acceso Basado en Roles (RBAC):
* **Lado del Servidor (Backend)**: [backend/app/core/permissions.py](file:///F:/Plataforma-MEH/backend/app/core/permissions.py)
  * Define los roles (`ROLE_ADMIN`, `ROLE_ORGANIZADOR`, `ROLE_SOPORTE`, `ROLE_MODERADOR`, etc.), la herencia y asignación de permisos directos.
  * Función `ensure_permission(user_role, permission)`: Se llama en los endpoints de FastAPI para rechazar peticiones con un código de error HTTP `403` si el rol no cumple.
* **Lado del Cliente (Frontend)**: [frontend/src/auth/rbac.js](file:///F:/Plataforma-MEH/frontend/src/auth/rbac.js)
  * Mapeo paralelo de permisos. Permite usar funciones reactivas como `hasPermission(userRole, permission)` para deshabilitar o renderizar condicionalmente botones en la interfaz de usuario.
