---
title: Matriz de Control de Acceso por Roles (RBAC)
sidebar_label: 02. Roles y Privilegios
---

# Matriz de Control de Acceso por Roles (RBAC)

Para garantizar la seguridad, la confidencialidad de la información financiera y el orden logístico en las capacitaciones, la Plataforma MEH implementa un modelo jerárquico de **Control de Acceso Basado en Roles (RBAC)**. 

La jerarquía física de permisos a nivel de base de datos y validación de tokens JWT en backend y frontend se estructura de la siguiente manera:

`ADMIN` (Consola Total) ➔ `ORGANIZADOR` (Control Operativo) ➔ `MODERADOR` (Co-Organizador) ➔ `SOPORTE` (Logística QR) ➔ `EMBAJADOR` (Líder VIP) ➔ `MIEMBRO` (Estudiante estándar)

---

## 1. Tabla Comparativa de Capacidades (¿Qué PUEDE y NO PUEDE hacer?)

A continuación se detalla exhaustivamente la matriz de acciones transaccionales permitidas y denegadas por cada rol a nivel de la lógica de servicios del backend:

| Rol del Sistema | Lo que SÍ PUEDE hacer | Lo que NO PUEDE hacer |
|---|---|---|
| **Miembro** | • Inscribirse a eventos y cursos activos.<br/>• Responder foros y subir entregas de tareas.<br/>• Registrar transferencias bancarias (subir vouchers).<br/>• Descargar certificados y verificar títulos. | • Modificar stock o precios de souvenirs.<br/>• Crear cursos, lecciones o calificar tareas.<br/>• Validar inscripciones o vouchers ajenos.<br/>• Cambiar privilegios de otros usuarios. |
| **Embajador** | • Todo lo que hace el Miembro.<br/>• Descargar plantillas de código y guías en la Biblioteca VIP. | • Crear o editar cursos y lecciones.<br/>• Aprobar o procesar OCR de vouchers financieros.<br/>• Escanear códigos QR de asistencia en checkpoints. |
| **Soporte** | • Todo lo que hace el Miembro.<br/>• Escanear códigos QR de asistentes en checkpoints en puerta.<br/>• Validar el ingreso síncrono al evento. | • Modificar stock o registrar productos de souvenirs.<br/>• Emitir certificados académicos masivos.<br/>• Aprobar transacciones financieras o vouchers. |
| **Moderador** | • Todo lo que hace el Soporte.<br/>• Moderar preguntas del foro y responder a alumnos.<br/>• Modificar el estado y cupo de inscripciones a eventos. | • Emitir certificados criptográficos masivos.<br/>• Validar o procesar conciliación OCR de pagos.<br/>• Acceder a la consola completa de logs de auditoría. |
| **Organizador**| • Todo lo que hace el Moderador.<br/>• Crear y programar eventos, calendarizar y editar agendas.<br/>• Crear cursos, lecciones, registrar tareas y calificarlas.<br/>• Emitir certificados académicos de sus cursos/eventos. | • Modificar configuraciones globales clave-valor del Hub.<br/>• Aprobar o conciliar vouchers financieros (pago de kits).<br/>• Consultar la bitácora física completa de logs por IP. |
| **Administrador**| • **Acceso y Control Absoluto (Full Access).**<br/>• Cambiar de rol a usuarios y suspender cuentas.<br/>• Validar vouchers bancarios manualmente o mediante visión OCR.<br/>• Gestionar souvenirs, stock, categorías e inventario.<br/>• Consultar logs físicos por IP para control de fraudes.<br/>• Modificar configuraciones globales del Hub. | • No tiene restricciones operativas dentro de los límites del ecosistema tecnológico de la comunidad. |

---

## 2. Tabla Comparativa de Visibilidad (¿Qué PUEDE y NO PUEDE ver?)

El frontend oculta o muestra componentes visuales de Fluent UI en base a la evaluación del token JWT. A continuación se desglosa el mapa de visibilidad de las vistas del sistema:

| Rol del Sistema | Vistas de la Interfaz que SÍ PUEDE ver | Vistas de la Interfaz que NO PUEDE ver |
|---|---|---|
| **Miembro** | • Landing, Login, Registro.<br/>• Dashboard del Estudiante, Grid de Insignias.<br/>• Learning Hub, Aula Virtual LMS, Foros.<br/>• Catálogo de Souvenirs, Historial de Pagos y verificar certificados. | • Consola máster de Administración (`/admin`).<br/>• Biblioteca de Recursos VIP (`/recursos`).<br/>• Cámara para escaneo QR de asistencia (`/escaneo-qr`).<br/>• Consola de organizador (`/organizador/eventos`). |
| **Embajador** | • Todo lo visible para el Miembro.<br/>• Pestaña y descargas de la **Biblioteca de Recursos VIP** (`/recursos`). | • Consola máster de Administración (`/admin`).<br/>• Cámara de escaneo QR de asistencia (`/escaneo-qr`).<br/>• Consola de organizador (`/organizador/eventos`). |
| **Soporte** | • Todo lo visible para el Miembro.<br/>• Pestaña y visor de la **Cámara de Escaneo QR** (`/escaneo-qr`). | • Consola máster de Administración (`/admin`).<br/>• Biblioteca de Recursos VIP (`/recursos`).<br/>• Consola de organizador (`/organizador/eventos`). |
| **Moderador** | • Todo lo visible para el Soporte.<br/>• Panel de control de inscripciones de eventos. | • Consola máster de Administración (`/admin`).<br/>• Biblioteca de Recursos VIP (`/recursos`).<br/>• Panel de creación curricular de la academia LMS. |
| **Organizador**| • Todo lo visible para el Moderador.<br/>• Panel del Organizador de Eventos (`/organizador/eventos`).<br/>• Pestañas de creación de cursos, lecciones, tareas y emisión. | • Configuración de la tienda de souvenirs.<br/>• Consola de validación OCR de vouchers financieros.<br/>• Panel de logs de auditoría por dirección IP. |
| **Administrador**| • **Visualiza el 100% de las rutas, componentes, modales y pestañas del sistema.**<br/>• Consola máster de Administración (`/admin`) y sus subpestañas lógicas (Analytics, OCR, Souvenirs, etc.). | • No tiene restricciones de visibilidad de vistas dentro de la SPA en React de la plataforma. |
