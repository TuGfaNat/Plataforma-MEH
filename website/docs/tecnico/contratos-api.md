---
id: contratos-api
title: Contratos de APIs REST (M3)
sidebar_label: Contratos de APIs (M3)
---

# Contratos de APIs REST (Sección M3)

:::info Docs-as-Code — Derivado del Código Fuente
Este documento se genera automáticamente a partir de los routers FastAPI en `backend/app/api/*.py`.
Cualquier modificación en rutas, métodos o permisos se refleja directamente en esta especificación.
:::

**Total de módulos de API documentados:** 20  
**Total de endpoints expuestos:** 163

---

## Módulo `academia` (Prefix: `/academia`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/academia/cursos/{id_curso}/lecciones` | Obtiene la lista de lecciones activas de un curso (Acceso Público/Miembros). | `id_curso: int` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/academia/lecciones` | Crea una nueva lección en un curso. Requiere permiso 'courses.manage'. | `data: LeccionCreate` | `201 Created` | Requiere Auth (JWT), Permiso courses_manage |
| **`PUT`** | `/api/academia/lecciones/{id_leccion}` | Actualiza la información de una lección. Requiere permiso 'courses.manage'. | `id_leccion: int`, `data: dict` | `200 OK` | Requiere Auth (JWT), Permiso courses_manage |
| **`DELETE`** | `/api/academia/lecciones/{id_leccion}` | Elimina lógicamente una lección. Requiere permiso 'courses.manage'. | `id_leccion: int` | `204 No Content` | Requiere Auth (JWT), Permiso courses_manage |
| **`GET`** | `/api/academia/lecciones/{id_leccion}/tareas` | Lista todas las tareas asociadas a una lección (Acceso Público/Miembros). | `id_leccion: int` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/academia/tareas` | Crea una tarea asignada a una lección. Requiere permiso 'courses.manage'. | `data: TareaCreate` | `201 Created` | Requiere Auth (JWT), Permiso courses_manage |
| **`PUT`** | `/api/academia/tareas/{id_tarea}` | Edita la información de una tarea existente. Requiere permiso 'courses.manage'. | `id_tarea: int`, `data: dict` | `200 OK` | Requiere Auth (JWT), Permiso courses_manage |
| **`DELETE`** | `/api/academia/tareas/{id_tarea}` | Elimina lógicamente una tarea de la lección. Requiere permiso 'courses.manage'. | `id_tarea: int` | `204 No Content` | Requiere Auth (JWT), Permiso courses_manage |
| **`GET`** | `/api/academia/tareas/{id_tarea}/entregas` | Obtiene la lista de entregas realizadas por los estudiantes. Requiere permiso 'courses.manage'. | `id_tarea: int` | `200 OK` | Requiere Auth (JWT), Permiso courses_manage |
| **`POST`** | `/api/academia/tareas/entregar` | Permite a un estudiante enviar su tarea resuelta (subida de enlace/archivo). | `data: EntregaTareaCreate` | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/academia/entregas/{id_entrega}/calificar` | Permite al docente/soporte calificar la entrega de un alumno. Requiere permiso 'courses.manage'. | `id_entrega: int`, `data: EntregaTareaCalificar` | `200 OK` | Requiere Auth (JWT), Permiso courses_manage |
| **`GET`** | `/api/academia/cursos/{id_curso}/foro` | Lista las publicaciones en el foro de discusión de un curso específico. | `id_curso: int` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/academia/foro` | Crea una nueva publicación o comentario en el foro de discusión de un curso. | `data: PostForoCreate` | `200 OK` | Requiere Auth (JWT) |

## Módulo `admin_directories` (Prefix: `/admin-directories`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/admin-directories/speakers` | Operación get_speakers | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/admin-directories/speakers` | Operación create_speaker | `data: SpeakerCreate` | `201 Created` | Requiere Auth (JWT) |
| **`PUT`** | `/api/admin-directories/speakers/{id_speaker}` | Operación update_speaker | `id_speaker: int`, `data: SpeakerUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/admin-directories/speakers/{id_speaker}` | Operación delete_speaker | `id_speaker: int` | `204 No Content` | Requiere Auth (JWT) |
| **`GET`** | `/api/admin-directories/auspiciadores` | Operación get_auspiciadores | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/admin-directories/auspiciadores` | Operación create_auspiciador | `data: AuspiciadorCreate` | `201 Created` | Requiere Auth (JWT) |
| **`PUT`** | `/api/admin-directories/auspiciadores/{id_auspiciador}` | Operación update_auspiciador | `id_auspiciador: int`, `data: AuspiciadorUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/admin-directories/auspiciadores/{id_auspiciador}` | Operación delete_auspiciador | `id_auspiciador: int` | `204 No Content` | Requiere Auth (JWT) |
| **`GET`** | `/api/admin-directories/comunidades` | Operación get_comunidades | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/admin-directories/comunidades` | Operación create_comunidad | `data: ComunidadCreate` | `201 Created` | Requiere Auth (JWT) |
| **`PUT`** | `/api/admin-directories/comunidades/{id_comunidad}` | Operación update_comunidad | `id_comunidad: int`, `data: ComunidadUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/admin-directories/comunidades/{id_comunidad}` | Operación delete_comunidad | `id_comunidad: int` | `204 No Content` | Requiere Auth (JWT) |

## Módulo `asistencia` (Prefix: `/asistencia`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/asistencia/actividades` | Operación get_actividades | - | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/asistencia/registrar` | Operación registrar | `tipo: str`, `id_actividad: int`, `id_usuario: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/asistencia/deshacer` | Deshace un escaneo accidental dentro de una ventana de 30 segundos (Admin sin límite) con auditoría (MEH-018). | `payload: AsistenciaDeshacerRequest` | `200 OK` | Requiere Auth (JWT) |

## Módulo `auth` (Prefix: `/auth`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`POST`** | `/api/auth/register` | Endpoint para el registro público de nuevos miembros. | `user: UserCreate` | `201 Created` | Público / Abierto |
| **`POST`** | `/api/auth/login` | Endpoint para inicio de sesión tradicional. | `user_credentials: UserLogin` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/auth/forgot-password` | Endpoint para solicitar restablecimiento de contraseña. | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/auth/reset-password` | Endpoint para completar el restablecimiento de contraseña. | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/auth/google` | Endpoint para autenticación mediante Google OAuth. | `payload: dict` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/auth/me` | Obtiene el perfil del usuario autenticado. | - | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/auth/me` | Actualiza los datos del perfil del usuario autenticado. | `user_update: UserUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/auth/me/password` | Cambia la contraseña del usuario autenticado (primer login o cambio voluntario). | `datos: CambiarPasswordRequest` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/auth/verificar-email` | Verifica el correo electrónico de un usuario con el código recibido. | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/auth/reenviar-codigo` | Reenvía un nuevo código de verificación al correo. | - | `200 OK` | Público / Abierto |
| **`GET`** | `/api/auth/usuarios` | Lista todos los usuarios (Solo para personal con permisos). | - | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/auth/usuarios/{id_usuario}` | Actualiza datos de un usuario desde administración (Solo ADMIN). | `id_usuario: int`, `payload: AdminUserUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/auth/usuarios/{id_usuario}/reset-password` | Restablece la contraseña de un usuario directamente (Solo ADMIN). | `id_usuario: int`, `payload: AdminResetPasswordRequest` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/auth/usuarios/{id_usuario}/suspender` | Suspende a un usuario con motivo (Solo ADMIN). | `id_usuario: int`, `payload: SuspenderUsuarioRequest` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/auth/usuarios/{id_usuario}/restaurar` | Restaura una cuenta de usuario suspendida (Solo ADMIN). | `id_usuario: int` | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/auth/usuarios/{id_usuario}/rol` | Cambia el rango de un usuario (Solo para Administradores). | `id_usuario: int`, `nuevo_rol: str` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/auth/usuarios/{id_usuario}` | Suspende lógicamente un usuario sin borrado físico (Solo Administradores). | `id_usuario: int` | `204 No Content` | Requiere Auth (JWT) |
| **`GET`** | `/api/auth/directorio` | Directorio de miembros con métricas y nivel (Solo ADMIN/ORGANIZADOR). | `skip: int`, `limit: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/auth/admin/users` | Endpoint para que Administradores y Organizadores creen cuentas de usuario directamente. | `payload: dict` | `201 Created` | Requiere Auth (JWT), Staff / Organizador |

## Módulo `badges` (Prefix: `/insignias`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/insignias` | Operación read_badges | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/insignias` | Operación create_badge | `badge: BadgeCreate` | `200 OK` | Requiere Auth (JWT), Permiso badges_manage |
| **`PUT`** | `/api/insignias/{id_badge}` | Operación update_badge | `id_badge: int`, `badge: BadgeUpdate` | `200 OK` | Requiere Auth (JWT), Permiso badges_manage |
| **`DELETE`** | `/api/insignias/{id_badge}` | Operación delete_badge | `id_badge: int` | `200 OK` | Requiere Auth (JWT), Permiso badges_manage |
| **`GET`** | `/api/insignias/usuario/{id_usuario}` | Operación read_user_badges | `id_usuario: int` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/insignias/asignar` | Operación assign_badge | `id_usuario: int`, `id_badge: int` | `200 OK` | Requiere Auth (JWT), Permiso badges_manage |

## Módulo `certificados_admin` (Prefix: `/certificados-admin`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`POST`** | `/api/certificados-admin/bulk` | Operación generate_bulk | `tipo: str`, `id_referencia: int`, `criterio: str`, `titulo: str`, `background: UploadFile` | `200 OK` | Requiere Auth (JWT) |

## Módulo `cleanup` (Prefix: `/admin/cleanup`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/admin/cleanup/status` | Devuelve el estado del módulo de limpieza y configuración general (Solo ADMIN). | - | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`GET`** | `/api/admin/cleanup/catalog` | Obtiene el catálogo completo de tablas limpiables, conteos por origen y matriz de dependencias. | - | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`GET`** | `/api/admin/cleanup/tables/{tabla}/rows` | Lista los registros de una tabla con creador, fechas, padre, clasificación SEED/REAL/OCR y protección. | `tabla: str`, `include_deleted: bool` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`GET`** | `/api/admin/cleanup/protected` | Obtiene la cuenta Superadmin, el usuario actual y la lista blanca de correos protegidos. | - | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`PUT`** | `/api/admin/cleanup/protected/whitelist` | Actualiza la lista blanca configurable de correos protegidos contra limpieza. | `payload: WhitelistUpdateRequest` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`GET`** | `/api/admin/cleanup/presets` | Lista los presets de limpieza disponibles, incluido 'Dejar solo superadmin' y presets personalizados. | - | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`POST`** | `/api/admin/cleanup/presets` | Crea o actualiza un preset personalizado de limpieza. | `payload: CleanupPresetCreateRequest` | `201 Created` | Requiere Auth (JWT), Solo ADMIN |
| **`DELETE`** | `/api/admin/cleanup/presets/{preset_id}` | Elimina un preset personalizado. | `preset_id: str` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`POST`** | `/api/admin/cleanup/presets/{preset_id}/resolve` | Resuelve un preset a la selección concreta de tablas e IDs (excluyendo protegidos). | `preset_id: str` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`POST`** | `/api/admin/cleanup/preview` | Calcula la previsualización de la limpieza con dependencias, bloqueos, orígenes y selection_hash. | `payload: CleanupPreviewRequest` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`POST`** | `/api/admin/cleanup/backup` | Genera un respaldo JSON obligatorio fuera de /static con TTL de 30 minutos para la selección actual. | `payload: CleanupBackupRequest` | `201 Created` | Requiere Auth (JWT), Solo ADMIN |
| **`GET`** | `/api/admin/cleanup/backup/{backup_id}` | Descarga el archivo JSON de un respaldo vigente (TTL de 30 min). | `backup_id: str` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`POST`** | `/api/admin/cleanup/execute` | Ejecuta la limpieza selectiva en transacción atómica verificando backup, hash, frase, contraseña y motivo. | `payload: CleanupExecuteRequest` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |

## Módulo `comunidad` (Prefix: `/comunidad`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/comunidad/miembros` | Lista todos los perfiles marcados como públicos. | - | `200 OK` | Público / Abierto |
| **`GET`** | `/api/comunidad/miembros/{id_usuario}` | Obtiene el detalle de un perfil público. | `id_usuario: int` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/comunidad/anuncios` | Muestra los anuncios activos para la comunidad. | - | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/comunidad/anuncios/all` | Lista todos los anuncios (incluyendo inactivos) para gestión (Solo Staff). | - | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/comunidad/anuncios/dry-run` | Simula el envío por correo de un anuncio con los filtros configurados sin enviar correos reales ni persistir en BD. | `anuncio: AnuncioCreate` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/comunidad/anuncios` | Crea y publica un nuevo anuncio (o ejecuta dry-run si dry_run=True). | `anuncio: AnuncioCreate` | `201 Created` | Requiere Auth (JWT) |
| **`PUT`** | `/api/comunidad/anuncios/{id_anuncio}` | Actualiza un anuncio existente. | `id_anuncio: int`, `anuncio: AnuncioUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/comunidad/anuncios/{id_anuncio}` | Elimina permanentemente un anuncio. | `id_anuncio: int` | `204 No Content` | Requiere Auth (JWT) |

## Módulo `cursos` (Prefix: `/cursos`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/cursos` | Operación get_cursos | `skip: int`, `limit: int` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/cursos/mis-certificados` | Operación get_mis_certificados | - | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/cursos/verificar/{uuid_cert}` | Operación verificar_certificado | `uuid_cert: str` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/cursos` | Operación create_curso | `curso: CursoCreate` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/cursos/{id_curso}` | Operación get_curso | `id_curso: int` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/cursos/instructor/mis-cursos` | Operación get_instructor_cursos | - | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/cursos/instructor/curso/{id_curso}/alumnos` | Operación get_curso_alumnos | `id_curso: int` | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/cursos/instructor/nota/{id_inscripcion}` | Operación update_nota_alumno | `id_inscripcion: int`, `nota: float` | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/cursos/{id_curso}/instructor/{id_instructor}` | Asigna un docente o instructor a un curso específico. | `id_curso: int`, `id_instructor: int` | `200 OK` | Requiere Auth (JWT), Permiso courses_manage |
| **`PUT`** | `/api/cursos/{id_curso}` | Operación update_curso | `id_curso: int`, `curso: CursoUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/cursos/{id_curso}` | Elimina lógicamente un curso (Solo Staff). | `id_curso: int` | `204 No Content` | Requiere Auth (JWT) |

## Módulo `dashboard` (Prefix: `/dashboard`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/dashboard/stats` | Obtiene estadísticas de rendimiento y KPIs con filtros de eventos (Solo ADMIN/ORGANIZADOR). | - | `200 OK` | Requiere Auth (JWT), Permiso audit_read |
| **`GET`** | `/api/dashboard/directorio` | Directorio de miembros con métricas y nivel (Solo ADMIN/ORGANIZADOR). | `skip: int`, `limit: int` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/dashboard/personal-stats` | Obtiene estadísticas personales del miembro logueado (Cualquier usuario). | - | `200 OK` | Requiere Auth (JWT) |

## Módulo `eventos` (Prefix: `/eventos`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`POST`** | `/api/eventos` | Crea un nuevo evento (Solo Staff). | `evento: EventoCreate` | `201 Created` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos` | Lista todos los eventos disponibles. | `skip: int`, `limit: int` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/eventos/{id_evento}` | Obtiene los detalles de un evento específico. | `id_evento: int` | `200 OK` | Público / Abierto |
| **`PUT`** | `/api/eventos/{id_evento}` | Actualiza la información de un evento (Solo Staff). | `id_evento: int`, `evento: EventoUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/cancelar` | Cancela un evento con un motivo específico y notifica a todos los inscritos (Solo Staff autorizado). | `id_evento: int`, `payload: EventoCancelarRequest` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/avisar` | Emite un aviso oficial in-app (y opcionalmente email) exclusivamente a los inscritos confirmados (Solo Staff autorizado). | `id_evento: int`, `payload: EventoAvisarRequest` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/asistencia-qr` | Registra asistencia mediante el escaneo de un código QR, soportando checkpoints dinámicos. | `payload: QRScanRequest` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/asistencia-qr` | Compatibilidad legacy para el frontend anterior. | `id_evento: int`, `token_qr: str` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/checkpoints` | Operación get_checkpoints | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/checkpoints` | Operación create_checkpoint | `id_evento: int`, `data: CheckpointCreate` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/checkpoints/{id_checkpoint}/permisos` | Lista operadores y permisos asignados a un checkpoint (MEH-018). | `id_evento: int`, `id_checkpoint: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/checkpoints/{id_checkpoint}/permisos` | Asigna o actualiza el permiso de un operador en un checkpoint (MEH-018). | `id_evento: int`, `id_checkpoint: int`, `payload: CheckpointPermisoCreate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/eventos/{id_evento}/checkpoints/{id_checkpoint}/permisos/{id_usuario}` | Revoca el permiso de un operador en un checkpoint (MEH-018). | `id_evento: int`, `id_checkpoint: int`, `id_usuario: int` | `204 No Content` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/asistencia/deshacer` | Deshace un escaneo accidental dentro de una ventana de 30 segundos (Admin sin límite) con auditoría (MEH-018). | `payload: AsistenciaDeshacerRequest` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/historial-asistencia` | Obtiene el historial paginado de escaneos de asistencia por evento (MEH-018). | `id_evento: int`, `page: int`, `limit: int` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/eventos/{id_evento}` | Elimina lógicamente un evento (Solo Staff). | `id_evento: int` | `204 No Content` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/inscritos-confirmados` | Obtiene la lista de inscritos confirmados para descargarlos localmente para escaneo offline. | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/token-qr` | Obtiene el token_qr del evento para difusión y acreditación. | `id_evento: int` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/eventos/{id_evento}/qr-image` | Descarga la imagen PNG del QR del evento generada localmente en el backend. | `id_evento: int` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/eventos/{id_evento}/pagos-qr` | Obtiene los paquetes y QRs de pago configurados para un evento. | `id_evento: int` | `200 OK` | Público / Abierto |
| **`POST`** | `/api/eventos/{id_evento}/pagos-qr` | Crea un paquete de pago y QR asociado a un evento con validación y anti-duplicado. | `id_evento: int`, `nombre_paquete: str`, `monto: float`, `file: UploadFile` | `201 Created` | Requiere Auth (JWT) |
| **`PUT`** | `/api/eventos/pagos-qr/{id_qr}` | Actualiza datos y/o código QR de un paquete de pago con anti-duplicado (Admin, Organizador, Moderador). | `id_qr: int` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/eventos/pagos-qr/{id_qr}` | Elimina lógicamente un paquete de pago QR (Admin, Organizador, Moderador). | `id_qr: int` | `204 No Content` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/acreditar` | Acredita manualmente a un participante en el evento (Solo ADMIN y ORGANIZADOR). | `id_evento: int`, `payload: AcreditarParticipanteRequest` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/inscritos.csv` | Exporta la lista completa de inscritos y su asistencia en formato CSV con UTF-8 BOM (Solo Staff). | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/aprobar-lista-espera` | Aprueba en lote a los inscritos en lista de espera respetando los cupos disponibles (Solo Staff). | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/duplicar` | Duplica un evento existente copiando su configuración, agenda, speakers y paquetes de pago (Solo Staff). | `id_evento: int` | `201 Created` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/llegadas` | Obtiene métricas de llegadas por hora y resumen por checkpoint (Solo Staff o Creador). | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/eventos/{id_evento}/badge-info` | Obtiene los datos del badge social para el participante inscrito o vista previa staff. | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/{id_evento}/plantilla-badge` | Carga y actualiza la plantilla de badge social de un evento (Solo Staff). | `id_evento: int`, `file: UploadFile` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/eventos/imagen` | Valida y procesa una imagen de portada generando original y variantes 16:9 y 1:1 antes de guardar el evento (Solo Staff). | `file: UploadFile` | `200 OK` | Requiere Auth (JWT), Staff / Organizador |
| **`POST`** | `/api/eventos/{id_evento}/imagen` | Sube o reemplaza la imagen de portada de un evento existente generando sus variantes 16:9 y 1:1 (Solo Staff). | `id_evento: int`, `file: UploadFile` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/eventos/{id_evento}/imagen` | Elimina la imagen de portada de un evento y limpia sus variantes en disco (Solo Staff). | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |

## Módulo `files` (Prefix: `/files`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`POST`** | `/api/files/upload` | Guarda una subida REAL en la carpeta backend/static/uploads/ | `file: UploadFile` | `200 OK` | Requiere Auth (JWT) |

## Módulo `inscripciones` (Prefix: `/inscripciones`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`POST`** | `/api/inscripciones/eventos/{id_evento}` | Inscribe al usuario actual en un evento con soporte de idempotencia. | `id_evento: int` | `201 Created` | Requiere Auth (JWT) |
| **`POST`** | `/api/inscripciones/inscribir/{id_evento}` | Compatibilidad legacy para el flujo de inscripción anterior con idempotencia. | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/inscripciones/eventos/mis-inscripciones` | Obtiene el historial de inscripciones del usuario actual. | - | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/inscripciones/eventos/{id_inscripcion}` | Cancela una inscripción pendiente. | `id_inscripcion: int` | `204 No Content` | Requiere Auth (JWT) |
| **`PUT`** | `/api/inscripciones/eventos/{id_inscripcion}/aprobar` | Aprueba a un participante en lista de espera (Solo Staff). | `id_inscripcion: int` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/inscripciones/eventos/{id_evento}/lista-espera` | Obtiene la lista de espera de un evento (Solo Staff). | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/inscripciones/eventos/{id_evento}/participantes` | Obtiene la lista completa de inscritos y sus estados para un evento (Solo Staff). | `id_evento: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/inscripciones/cursos/{id_curso}` | Inscribe al usuario actual en un curso. | `id_curso: int` | `201 Created` | Requiere Auth (JWT) |
| **`GET`** | `/api/inscripciones/cursos/mis-inscripciones` | Obtiene las inscripciones a cursos del usuario actual. | - | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/inscripciones/cursos/{id_curso}/progreso` | Actualiza el progreso de un usuario en un curso. | `id_curso: int`, `progreso: int` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/inscripciones/eventos/{id_evento}/manual` | Inscripcion manual de un miembro a un evento por parte del Staff (Admin u Organizador). | `id_evento: int`, `data: InscribirManualBody` | `201 Created` | Requiere Auth (JWT), Staff / Organizador |

## Módulo `learning_path` (Prefix: `/ms-learning`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/ms-learning/catalog` | Proxy para la Microsoft Learn Catalog API. | `locale: str` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/ms-learning/catalog/modules` | Retorna solo los módulos del catálogo | `locale: str` | `200 OK` | Público / Abierto |
| **`GET`** | `/api/ms-learning/catalog/learning-paths` | Retorna solo las rutas de aprendizaje del catálogo | `locale: str` | `200 OK` | Público / Abierto |

## Módulo `logs` (Prefix: `/logs`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/logs` | Consulta la trazabilidad total de acciones en el sistema (Solo Administradores). | `skip: int`, `limit: int` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |
| **`GET`** | `/api/logs` | Consulta la trazabilidad total de acciones en el sistema (Solo Administradores). | `skip: int`, `limit: int` | `200 OK` | Requiere Auth (JWT), Solo ADMIN |

## Módulo `pagos` (Prefix: `/pagos`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`POST`** | `/api/pagos/upload-comprobante` | Sube un comprobante de pago para validación. | `id_referencia: int`, `tipo_referencia: str`, `monto: Decimal`, `metodo_pago: str`, `file: UploadFile` | `201 Created` | Requiere Auth (JWT) |
| **`POST`** | `/api/pagos/upload-comprobante-ocr` | Sube un comprobante de pago para validación automática vía OCR. | `id_referencia: int`, `tipo_referencia: str`, `monto: Decimal`, `metodo_pago: str`, `file: UploadFile` | `201 Created` | Requiere Auth (JWT) |
| **`GET`** | `/api/pagos/mis-pagos` | Obtiene la lista de pagos realizados por el usuario actual. | - | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/pagos/admin/todos` | Lista todos los pagos del sistema (Admin/Soporte). | - | `200 OK` | Requiere Auth (JWT) |
| **`PUT`** | `/api/pagos/admin/{id_pago}/validar` | Aprueba o rechaza un pago pendiente (Admin/Soporte). | `id_pago: int`, `pago_update: PagoUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/pagos/admin/ocrm-match` | Procesa un extracto bancario para conciliación automática. | `file: UploadFile` | `200 OK` | Requiere Auth (JWT) |
| **`GET`** | `/api/pagos/historial` | Obtiene el timeline histórico de eventos de pago (miembro o staff). | - | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/pagos/{id_pago}/reintentar` | Permite volver a subir un comprobante para un pago que fue RECHAZADO. | `id_pago: int`, `file: UploadFile` | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/pagos/{id_pago}/reembolsar` | Reembolsa manualmente un pago en estado APROBADO (Solo Staff con permiso). | `id_pago: int`, `reembolso_req: PagoReembolsoRequest` | `200 OK` | Requiere Auth (JWT) |

## Módulo `papelera` (Prefix: `/admin/papelera`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/admin/papelera` | Obtiene todos los registros en estado ELIMINADO (0) accesibles por el rol del usuario. | - | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/admin/papelera/restaurar/{category}/{item_id}` | Restaura un elemento eliminado lógicamente (id_estado = 2). En usuarios reactiva cuenta y limpia suspensión. | `category: str`, `item_id: int` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/admin/papelera/destruir/{category}/{item_id}` | Borra físicamente un elemento de la base de datos de manera definitiva (Solo Admin). | `category: str`, `item_id: int` | `200 OK` | Requiere Auth (JWT) |

## Módulo `recursos` (Prefix: `/recursos`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/recursos` | Operación get_recursos | - | `200 OK` | Requiere Auth (JWT) |
| **`POST`** | `/api/recursos` | Operación create_recurso | `recurso: RecursoCreate` | `201 Created` | Requiere Auth (JWT) |
| **`PUT`** | `/api/recursos/{id_recurso}` | Operación update_recurso | `id_recurso: int`, `recurso_update: RecursoUpdate` | `200 OK` | Requiere Auth (JWT) |
| **`DELETE`** | `/api/recursos/{id_recurso}` | Operación delete_recurso | `id_recurso: int` | `204 No Content` | Requiere Auth (JWT) |

## Módulo `reports` (Prefix: `/reports`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/reports/dashboard-stats` | Operación get_dashboard_stats | - | `200 OK` | Requiere Auth (JWT), Permiso audit_read |

## Módulo `souvenirs` (Prefix: `/souvenirs`)

| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |
|---|---|---|---|---|---|
| **`GET`** | `/api/souvenirs` | Operación get_productos | - | `200 OK` | Público / Abierto |
| **`POST`** | `/api/souvenirs` | Operación create_producto | `data: ProductoCreate` | `201 Created` | Requiere Auth (JWT), Permiso events_manage |
| **`POST`** | `/api/souvenirs/ventas` | Operación register_venta | `data: VentaRequest` | `200 OK` | Requiere Auth (JWT), Permiso events_manage |
| **`GET`** | `/api/souvenirs/ventas` | Operación get_ventas | - | `200 OK` | Requiere Auth (JWT), Permiso events_manage |
| **`GET`** | `/api/souvenirs/{id_producto}` | Operación get_producto | `id_producto: int` | `200 OK` | Público / Abierto |
| **`PUT`** | `/api/souvenirs/{id_producto}` | Operación update_producto | `id_producto: int`, `data: ProductoUpdate` | `200 OK` | Requiere Auth (JWT), Permiso events_manage |
| **`DELETE`** | `/api/souvenirs/{id_producto}` | Operación delete_producto | `id_producto: int` | `204 No Content` | Requiere Auth (JWT), Permiso events_manage |
