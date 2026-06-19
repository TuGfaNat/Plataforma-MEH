# 🗺️ Guía y Mapa Arquitectónico del Sistema: Plataforma MEH

Esta guía sirve como **material de preparación y hoja de ruta para tu defensa de tesis**. Detalla exactamente dónde está instanciado, declarado y procesado cada componente clave en el frontend, backend y base de datos, además de incluir una sección de **Preguntas de Defensa Técnico-Académicas** frecuentes con sus respectivas respuestas fundamentadas.

---

## 📂 Estructura General del Proyecto

El proyecto está dividido bajo un modelo de arquitectura de monolito desacoplado:
1. **`backend/`**: Servidor RESTful escrito en Python con FastAPI, SQLAlchemy para la persistencia de datos (PostgreSQL/SQLite) y Pydantic para el tipado y validación de esquemas de datos.
2. **`frontend/`**: Cliente SPA (Single Page Application) desarrollado en React (Vite) enfocado en una interfaz accesible mediante Microsoft Fluent UI v9 y comunicación mediante Axios.

---

## 🗄️ 1. Base de Datos y Persistencia (ORM)

El sistema utiliza **SQLAlchemy** como ORM para mapear de manera relacional las entidades del sistema y administrar las transacciones.

### 📍 Puntos de Interés Clave:
* **Conexión e Instanciación**: [backend/app/database.py](file:///F:/Plataforma-MEH/backend/app/database.py)
  * `engine`: Instancia la conexión física al motor SQL.
  * `SessionLocal`: Fábrica de sesiones para interactuar con la base de datos de manera controlada.
  * `Base`: Clase base declarativa de la cual heredan todos los modelos de SQLAlchemy.
  * `get_db()`: Generador de dependencias (`yield`) para inyectar la sesión en los endpoints de FastAPI y garantizar que la conexión se cierre automáticamente tras finalizar la solicitud HTTP (patrón Unit of Work).
* **Declaración de Tablas (Modelos)**: [backend/app/models/models.py](file:///F:/Plataforma-MEH/backend/app/models/models.py)
  * Aquí están declaradas físicamente todas las tablas del sistema: `Usuario`, `Curso`, `Leccion`, `Tarea`, `EntregaTarea`, `Insignia`, `Pago`, `RegistroAuditoria`, `Evento`, `Anuncio`, `EventoPagoQR`, etc.
* **Logs Automáticos (Auditoría Forense)**: [backend/app/models/mixins.py](file:///F:/Plataforma-MEH/backend/app/models/mixins.py)
  * `AuditMixin` y `EstadoLifecycleMixin`: Monitorean de manera transparente mediante eventos de ciclo de vida (`before_insert`, `before_update`) toda alteración de base de datos e insertan automáticamente registros de auditoría detallados en `RegistroAuditoria` con las marcas de tiempo y el operador.
* **Migraciones de Base de Datos**: Carpeta [backend/alembic/](file:///F:/Plataforma-MEH/backend/alembic/)
  * Usamos **Alembic** para versionar la base de datos de manera incremental y controlable (por ejemplo, [add_event_payment_qrs](file:///F:/Plataforma-MEH/backend/alembic/versions/d2f530fc2803_add_event_payment_qrs.py)).

---

## 🐍 2. Backend (FastAPI)

FastAPI estructura la lógica en tres capas independientes: **API (Endpoints/Controladores)** ➔ **Services (Lógica de Negocio y Consultas)** ➔ **Schemas (Pydantic)**.

### 📍 Puntos de Interés Clave:
* **Punto de Entrada**: [backend/main.py](file:///F:/Plataforma-MEH/backend/main.py)
  * Inicializa `FastAPI()`, configura los middlewares de CORS para admitir las peticiones del frontend (puerto 5173), inicializa la telemetría con `Prometheus FastApi Instrumentator`, monta la carpeta estática `/static` para uploads/insignias y monta los enrutadores (`routers`).
* **Controladores y Rutas**: Carpeta [backend/app/api/](file:///F:/Plataforma-MEH/backend/app/api/)
  * `auth.py`: Autenticación, registro, login y obtención del perfil actual.
  * `eventos.py`: Programación y gestión física de eventos, incluyendo generación de credenciales QR.
  * `asistencia.py`: Escaneo y validación síncrona/en lote de marcas de asistencia en checkpoints.
  * `academia.py`: Administración curricular de la academia LMS, foros interactivos y entregas de tareas.
  * `pagos.py` y `souvenirs.py`: Carga y validación manual/OCR de vouchers bancarios y tienda de souvenirs.
* **Servicios de Base de Datos (Lógica de Negocio)**: Carpeta [backend/app/services/](file:///F:/Plataforma-MEH/backend/app/services/)
  * Capa encargada de la lógica transaccional y consultas complejas (`db.add()`, `db.commit()`, `db.query()`).
  * Ejemplos: `auth_service.py`, `cursos_service.py`, `eventos_service.py`, `ocrm_service.py` (análisis OCR y conciliación bancaria difusa).
* **Validación y Serialización de Datos (Schemas)**: Carpeta [backend/app/schemas/](file:///F:/Plataforma-MEH/backend/app/schemas/)
  * Esquemas basados en **Pydantic** que validan el tipo y estructura del cuerpo JSON entrante y saliente, sanitizando las peticiones (ej. `curso.py`, `pago.py`).

---

## ⚛️ 3. Frontend (React & Fluent UI)

El frontend es una aplicación SPA estructurada con React y compilada de manera ultra-rápida utilizando Vite.

### 📍 Puntos de Interés Clave:
* **Punto de Entrada**: [frontend/src/main.jsx](file:///F:/Plataforma-MEH/frontend/src/main.jsx)
  * Renderiza el árbol de React en el contenedor raíz HTML e inyecta el `FluentProvider` con la configuración estética global de Fluent UI v9.
* **Enrutador y Protección de Rutas (Guardias)**: [frontend/src/App.jsx](file:///F:/Plataforma-MEH/frontend/src/App.jsx)
  * Define las rutas de la SPA mediante React Router DOM.
  * `ProtectedRoute`: Componente guardián que evalúa el rol del usuario inyectado desde el token JWT. Redirige a `/login` si no está autenticado, o a `/acceso-denegado` si el rol no figura en `allowedRoles`.
* **Cliente de API y Gestión de Tokens**: [frontend/src/services/api.js](file:///F:/Plataforma-MEH/frontend/src/services/api.js)
  * Configura la instancia global de **Axios**.
  * **Interceptor de Petición**: Adjunta automáticamente la cabecera `Authorization: Bearer <TOKEN>` en cada petición HTTP si hay un token guardado en `localStorage`.
  * **Interceptor de Respuesta**: Captura códigos de error HTTP de manera global. Redirige a `/login` ante un `401 Unauthorized` (Token expirado) para forzar la reautenticación segura.
* **Consolas Específicas**: Carpeta [frontend/src/pages/](file:///F:/Plataforma-MEH/frontend/src/pages/)
  * `EscaneoQR.jsx`: Pantalla que activa la cámara del dispositivo móvil para la lectura de marcas en checkpoints, con soporte completo para base de datos IndexedDB en modo desconectado.
  * `GestionPagos.jsx`: Visualiza los vouchers y el procesamiento OCR correspondiente en una vista dividida.

---

## 🔑 4. Seguridad, Autenticación y RBAC

### 📍 Flujo del Token JWT (JSON Web Token):
1. El usuario envía sus credenciales al endpoint `POST /auth/login`.
2. El backend verifica la correspondencia usando **Bcrypt** en [backend/app/core/auth.py](file:///F:/Plataforma-MEH/backend/app/core/auth.py).
3. Si el login es correcto, el backend genera un token firmado criptográficamente con una clave privada (`SECRET_KEY`) usando el algoritmo **HS256**. El token contiene datos mínimos no sensibles (sub: correo/id, rol).
4. El frontend recibe el token y lo almacena localmente en `localStorage`.
5. En cada petición, el interceptor de Axios recupera e inyecta el token.
6. El backend lo descodifica y valida mediante `get_current_user` en el backend para autorizar la solicitud de manera *stateless* (sin guardar sesión en memoria del servidor).

### 📍 Control de Acceso Basado en Roles (RBAC):
* **Backend**: [backend/app/core/permissions.py](file:///F:/Plataforma-MEH/backend/app/core/permissions.py)
  * Mapea jerárquicamente los roles del sistema (`ADMIN`, `ORGANIZADOR`, `SOPORTE`, `MODERADOR`, `EMBAJADOR`, `MIEMBRO`).
  * Utiliza dependencias en FastAPI (`ensure_permission`) para validar los privilegios del token y lanzar un HTTP `403 Forbidden` si la acción no está autorizada para ese rol.
* **Frontend**: [frontend/src/auth/rbac.js](file:///F:/Plataforma-MEH/frontend/src/auth/rbac.js)
  * Provee la función utilitaria `hasPermission(userRole, permission)` que se utiliza a lo largo de las páginas para condicionar la renderización de elementos visuales (ej. ocultar botones de creación o borrado a alumnos comunes).

---

## 💡 5. Algoritmos Especiales e Innovación Técnica

### 📍 Reconciliación Bancaria Difusa (Jaro-Winkler):
* **Ubicación**: [backend/app/utils/similarity.py](file:///F:/Plataforma-MEH/backend/app/utils/similarity.py)
* **Propósito**: Emparejar de manera probabilística transacciones bancarias del extracto CSV contra los vouchers declarados por los estudiantes.
* **Detalle**: El algoritmo calcula la distancia de Jaro-Winkler, la cual mide la similitud entre cadenas de texto basándose en caracteres comunes y transposiciones de letras. Se utiliza un umbral mínimo de **85%** de similitud y una tolerancia temporal de **±3 días** para sugerir conciliaciones automáticas y seguras de depósitos, mitigando errores tipográficos manuales en apellidos (ej: "Mamani" vs "Mamany").

### 📍 Arquitectura Offline-First (IndexedDB):
* **Ubicación**: [frontend/src/utils/offlineDb.js](file:///F:/Plataforma-MEH/frontend/src/utils/offlineDb.js) y [frontend/src/pages/EscaneoQR.jsx](file:///F:/Plataforma-MEH/frontend/src/pages/EscaneoQR.jsx)
* **Propósito**: Permitir el control de acceso y marcas de asistencia mediante escaneo QR en sótanos o áreas de la facultad sin acceso a Internet.
* **Detalle**: Antes de iniciar el control en la puerta, el staff descarga de manera síncrona la lista de estudiantes autorizados en la base de datos del navegador (**IndexedDB**). En modo desconectado, el escáner valida localmente contra IndexedDB para dar feedback en milisegundos y evitar fraudes. Las marcas exitosas se guardan en una cola FIFO local (`cola_asistencia`) y se sincronizan al servidor FastAPI mediante solicitudes en lote una vez que se restablece la conectividad.

---

## 🎓 6. Preguntas y Respuestas Clave para la Defensa de Tesis

Estas preguntas abordan los aspectos técnicos del diseño y desarrollo del sistema que los evaluadores suelen indagar:

### P1: ¿Por qué eligió usar Autoincrementales Enteros (INTEGER SERIAL) en lugar de identificadores UUID?
> **Respuesta:** Se priorizó el rendimiento físico y la simplicidad del almacenamiento de datos. En PostgreSQL, los índices sobre columnas `INTEGER` (4 bytes) son significativamente más pequeños y más rápidos de indexar (operaciones de inserción y búsquedas en árboles B-Tree) comparados con los de `UUID` (16 bytes). Además, facilita la legibilidad en las trazas de auditoría de la facultad. Se previene la enumeración expuesta mediante firmas JWT y control estricto de accesos a nivel de filas en el backend.

### P2: ¿FastAPI es un framework asíncrono, por qué las consultas y la conexión de base de datos en su backend son síncronas?
> **Respuesta:** Se tomó la decisión de diseño de mantener una persistencia síncrona a través de SQLAlchemy para asegurar la consistencia y atomicidad estricta en las transacciones financieras (conciliación de pagos y stock de souvenirs). El modelo asíncrono en bases de datos relacionales añade complejidad innecesaria (ej. problemas de lazy loading de relaciones en transacciones complejas) y riesgo de condiciones de carrera sin aportar un beneficio sustancial en este ecosistema, donde la base de datos se aloja localmente o con baja latencia de red.

### P3: ¿Cómo previene su aplicación la Inyección SQL y ataques Cross-Site Scripting (XSS)?
> **Respuesta:** 
> * **Inyección SQL**: El ORM SQLAlchemy utiliza consultas parametrizadas por defecto en todas sus interfaces de consulta. En lugar de concatenar cadenas SQL directas, los argumentos del usuario se inyectan como parámetros sanitizados en el controlador del motor de base de datos.
> * **XSS (Cross-Site Scripting)**: React se encarga de escapar de forma automática cualquier valor que se intente inyectar en el árbol DOM mediante llaves `{}` en el código JSX, bloqueando la ejecución de código script no verificado. Adicionalmente, el input del usuario en formularios se valida bajo esquemas de caracteres específicos mediante Pydantic en el backend.

### P4: ¿Dónde y cómo se almacenan las contraseñas de los usuarios en su base de datos?
> **Respuesta:** Las contraseñas en texto claro nunca entran en la base de datos ni son almacenadas en memoria. Se procesan utilizando un algoritmo hash robusto de derivación de clave de un solo sentido: **Bcrypt** (con factor de trabajo adaptativo) implementado mediante `passlib.context` en [backend/app/core/auth.py](file:///F:/Plataforma-MEH/backend/app/core/auth.py). Esto asegura que, en caso de una fuga física del archivo de base de datos PostgreSQL, los atacantes no puedan revertir los hashes para descifrar las contraseñas de los miembros de la comunidad.

### P5: ¿Cómo garantiza que un token JWT robado del localStorage de un cliente no comprometa el sistema de por vida?
> **Respuesta:** Los tokens JWT generados por el sistema tienen un tiempo de expiración estricto de **24 horas** codificado en el payload (campo `exp`). Pasado este tiempo, el backend rechazará el token automáticamente obligando al usuario a reautenticarse. Adicionalmente, la arquitectura implementa estados de cuenta inalterables (es decir, el backend consulta en base de datos si el usuario está marcado como `activo = True` en su llamada middleware). Si la cuenta de un usuario es comprometida o dada de baja por el Administrador, se inhabilita de inmediato en la siguiente validación HTTP del middleware.
