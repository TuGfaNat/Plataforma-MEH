---
title: Mapeo de Componentes Frontend .jsx a la API Backend
sidebar_label: 03. Mapeo de Componentes .jsx
---

# Mapeo de Componentes Frontend `.jsx` a la API Backend

:::info METADATOS DEL DOCUMENTO
* **Propietario del Documento:** Nataly Gemio Morales (MLSA Ambassador / Carrera de Informática UMSA)
* **Versión:** 1.2.0
* **Última Actualización:** 2026-05-25
* **Audiencia Destinataria:** Desarrolladores Backend/Frontend, Administradores de Sistemas, Evaluadores Académicos de la UMSA.
:::

## 🎯 Propósito y Ámbito

Este documento tiene como propósito establecer la trazabilidad física completa entre la capa de presentación (vistas React `.jsx` del frontend) y los servicios/routers expuestos por el backend de FastAPI. Mapea de forma unificada las 23 páginas principales y las 9 pestañas del panel administrativo, detallando las tablas relacionales afectadas y el flujo transaccional.

---

## 1. Mapeo de las 23 Páginas Principales (`frontend/src/pages/`)

| # | Página Frontend `.jsx` | Ruta del Navegador | Router API Backend | Servicio del Backend | Tablas Afectadas | Flujo Transaccional de Datos |
|---|---|---|---|---|---|---|
| **1** | `Landing.jsx` | `/` | `eventos.py`, `admin_directories.py` | `eventos_service.py` | `eventos`, `anuncios`, `comunidades_aliadas` | Carga inicial del portal. Llama síncronamente a `GET /api/v1/eventos` y `GET /api/v1/anuncios` para poblar la cartelera e información de la landing. |
| **2** | `Login.jsx` | `/login` | `auth.py` | `auth_service.py` | `usuarios` | Digita credenciales, llama a `POST /api/v1/auth/login`. El servicio comprueba la contraseña mediante hash Bcrypt y devuelve el Token JWT que se guarda en el `AuthContext`. |
| **3** | `Register.jsx` | `/register` | `auth.py` | `auth_service.py` | `usuarios` | Formulario de registro público. Ejecuta `POST /api/v1/auth/register` insertando un registro con rol `'MIEMBRO'` e inyectando valores iniciales. |
| **4** | `ForgotPassword.jsx` | `/forgot-password` | `auth.py` | `auth_service.py`, `email_service.py` | `usuarios` | Recuperación de contraseñas. Envía correo a `POST /api/v1/auth/forgot-password` que genera un token temporal en la DB y despacha correo vía SMTP. |
| **5** | `ResetPassword.jsx` | `/reset-password` | `auth.py` | `auth_service.py` | `usuarios` | Cambio de clave física. Llama a `POST /api/v1/auth/reset-password` con el token validando la expiración en base de datos. |
| **6** | `Dashboard.jsx` | `/dashboard` | `dashboard.py` | `dashboard_service.py` | `usuarios`, `usuarios_badges`, `inscripciones_cursos` | Carga del panel del estudiante. Llama a `GET /api/v1/dashboard/stats` que realiza agregaciones de base de datos para computar puntos, medallas y cursos activos. |
| **7** | `Comunidad.jsx` | `/comunidad` | `comunidad.py` | `comunidad_service.py` | `comunidades_aliadas`, `usuarios` | Directorio social. Llama a `GET /api/v1/comunidad/aliadas` y `GET /api/v1/usuarios/publicos` para renderizar perfiles públicos habilitados. |
| **8** | `SpeakerKit.jsx` | `/speaker-kit` | `eventos.py` | `ecosistema_service.py` | `speakers` | Galería pública de ponentes destacados. Llama a `GET /api/v1/eventos/speakers` cargando biografía, trayectorias e información de contacto. |
| **9** | `LearningHub.jsx` | `/learning` | `cursos.py` | `cursos_service.py` | `cursos`, `inscripciones_cursos` | Aula LMS central. Llama a `GET /api/v1/cursos` listando las capacitaciones habilitadas y el progreso de avance académico del alumno. |
| **10**| `CursoAula.jsx` | `/learning/curso/:id` | `cursos.py`, `academia.py` | `cursos_service.py` | `cursos`, `lecciones`, `tareas`, `entregas_tareas`, `posts_foro` | Reproductor interactivo de clases. Llama a `GET /api/v1/cursos/:id/lecciones`, `POST /api/v1/cursos/lecciones/completar` y permite adjuntar entregas de tareas académicas. |
| **11**| `ValidadorTalento.jsx`| `/validador` | `academia.py`, `learning_path.py` | `academia_service.py` | `inscripciones_cursos`, `usuarios` | Validador de rutas externas. El usuario provee su URL de Microsoft Learn y llama a `POST /api/v1/learning_path/validar` registrando el avance. |
| **12**| `Insignias.jsx` | `/badges` | `badges.py` | `badge_service.py` | `badges`, `usuarios_badges` | Inventario de gamificación. Llama a `GET /api/v1/badges/usuario` mostrando las medallas desbloqueadas y puntos del perfil. |
| **13**| `Finanzas.jsx` | `/finanzas` | `pagos.py` | `pagos_service.py` | `pagos`, `usuarios` | Historial financiero del usuario. Llama a `GET /api/v1/pagos/usuario` y permite subir vouchers vía `POST /api/v1/pagos/subir` en multipart. |
| **14**| `RecursosVIP.jsx` | `/recursos` | `recursos.py` | `recurso_service.py` | `recursos` | Biblioteca vip para ponentes y embajadores. Llama a `GET /api/v1/recursos` (validando rol mayor o igual a `'EMBAJADOR'`). |
| **15**| `VerificarCertificado.jsx`| `/verificar`| `certificados_admin.py` | `certificado_generator_service.py` | `certificados`, `usuarios` | Auditoría de diplomas. El auditor ingresa el código legible y ejecuta `GET /api/v1/certificados/verificar/:codigo` retornando el hash de validez. |
| **16**| `EscaneoQR.jsx` | `/escaneo-qr` | `asistencia.py` | `asistencia_service.py` | `asistencia_detalles`, `inscripciones_eventos` | Cámara para checkpoints QR (Soporte). Gatilla `POST /api/v1/asistencia/scan` registrando la hora UTC exacta de entrada. |
| **17**| `EventsMaster.jsx` | `/organizador/eventos` | `eventos.py` | `eventos_service.py` | `eventos`, `inscripciones_eventos` | Control de Organizador. Carga congresos programados con `GET /api/v1/eventos/organizados` y permite exportar listados físicos de inscritos. |
| **18**| `AdminPanel.jsx` | `/admin` | `dashboard.py` | `dashboard_service.py` | (Multi-tabla) | Consola maestra de administración. Valida el rol `'ADMIN'` del token JWT y renderiza las pestañas de control. |
| **19**| `Users.jsx` | `/admin/users` | `auth.py` | `auth_service.py` | `usuarios` | Cambiar roles (ADMIN). Llama a `PUT /api/v1/auth/usuarios/:id/rol` y suspende/habilita accesos al Hub. |
| **20**| `Auditoria.jsx` | `/admin/auditoria` | `logs.py` | `logs_service.py` | `logs_sistema` | Bitácora física de seguridad. Ejecuta `GET /api/v1/logs` visualizando IP, ID de registro afectado y valores anteriores/nuevos. |
| **21**| `Configuracion.jsx` | `/configuracion` | `auth.py`, `files.py` | `auth_service.py` | `usuarios` | Actualizar perfil. Ejecuta `PUT /api/v1/auth/usuarios/perfil` guardando las redes sociales y preferencia de tema oscuro. |
| **22**| `GestionPagos.jsx` | `/admin/pagos` | `pagos.py` | `pagos_service.py` | `pagos` | Conciliación bancaria. Llama a `GET /api/v1/pagos/pendientes` permitiendo procesar ocr con `POST /api/v1/pagos/:id/procesar-ocr`. |
| **23**| `NotificacionesAdmin.jsx`| `/admin/alertas` | `admin_directories.py` | (Lógica directa) | `anuncios` | Crear comunicados. Ejecuta `POST /api/v1/anuncios` publicando anuncios instantáneos en la landing y dashboard. |

---

## 2. Mapeo de Pestañas de Control Administrativo (`pages/Admin/`)

Estos componentes residen físicamente bajo la carpeta de control `pages/Admin/` y son cargados dinámicamente como paneles dentro del contenedor maestro `AdminPanel.jsx`:

### 1. `Analytics.jsx`
* **Llamadas Backend:** `GET /api/v1/dashboard/stats/globales`.
* **Función y Visualización:** Renderiza gráficos de barras y líneas usando la librería **`Recharts`** para monitorear el ratio de crecimiento mensual de miembros, la tasa de asistencia por cada checkpoint QR e ingresos financieros por transferencias manuales.

### 2. `AcademyTab.jsx`
* **Llamadas Backend:** `GET /api/v1/academia/cursos`, `POST /api/v1/cursos/crear`.
* **Función y Visualización:** Consola curricular para instructores. Permite crear la ficha técnica de un curso, definir las horas académicas acreditadas, registrar lecciones con sus videos instructivos y definir las tareas calificables.

### 3. `AnnouncementsTab.jsx`
* **Llamadas Backend:** `GET /api/v1/anuncios/todos`, `POST /api/v1/anuncios/crear`.
* **Función y Visualización:** Consola para programar banners y comunicados del landing, configurando la fecha de vigencia y la imagen informativa del anuncio.

### 4. `EcosystemDirectory.jsx`
* **Llamadas Backend:** `GET /api/v1/comunidad/aliadas`, `POST /api/v1/comunidad/aliadas/crear`.
* **Función y Visualización:** Orquestación de marcas aliadas y ponentes destacados de la comunidad. Permite registrar logotipos e información de auspiciadores (categorías: Platinium, Gold, Silver).

### 5. `EventsTab.jsx`
* **Llamadas Backend:** `GET /api/v1/eventos/todos`, `POST /api/v1/eventos/crear`.
* **Función y Visualización:** Calendarización de eventos presenciales y online, definiendo la capacidad máxima de cupos y asociando ponentes.

### 6. `GeneradorCertificados.jsx`
* **Llamadas Backend:** `POST /api/v1/certificados/emitir/masivo`.
* **Función y Visualización:** Motor que gatilla la emisión masiva de diplomas con firma criptográfica. Utiliza la librería **`jsPDF`** en cliente para estructurar vectorialmente los títulos en base a plantillas Fluent UI y subirlos a la DB.

### 7. `LibraryTab.jsx`
* **Llamadas Backend:** `GET /api/v1/recursos/todos`, `POST /api/v1/recursos/subir`.
* **Función y Visualización:** Biblioteca VIP. Permite subir guías de desarrollo, manuales markdown y libros digitales premium.

### 8. `SouvenirsTab.jsx`
* **Llamadas Backend:** `GET /api/v1/souvenirs/stock`, `POST /api/v1/souvenirs/producto/crear`.
* **Función y Visualización:** Control de stock y precios de souvenirs del Hub, definiendo qué poleras o gorras se integran de forma automática como Kits de Evento.

### 9. `UsersTab.jsx`
* **Llamadas Backend:** `GET /api/v1/auth/usuarios/todos`.
* **Función y Visualización:** Listado tabular dinámico con filtros de búsqueda rápida para auditar perfiles de miembros registrados en el ecosistema.

---

## 🔗 Recursos y Artículos Relacionados

* [01. Arquitectura y Contexto C4](file:///f:/Plataforma-MEH/website/docs/tecnico/01-arquitectura-contexto.md)
* [02. Detalle de Frontend React](file:///f:/Plataforma-MEH/website/docs/tecnico/02-detalle-frontend.md)
* [04. Detalle de Backend FastAPI](file:///f:/Plataforma-MEH/website/docs/tecnico/04-detalle-backend.md)
* [05. Base de Datos y Seguridad](file:///f:/Plataforma-MEH/website/docs/tecnico/05-base-datos-seguridad.md)
