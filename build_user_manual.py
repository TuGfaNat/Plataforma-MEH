import os

# Configuración de rutas
BASE_DIR = 'website/docs/usuario'
os.makedirs(f'{BASE_DIR}/01-introduccion', exist_ok=True)
os.makedirs(f'{BASE_DIR}/02-guia-rapida', exist_ok=True)
os.makedirs(f'{BASE_DIR}/03-para-miembros', exist_ok=True)
os.makedirs(f'{BASE_DIR}/04-para-organizadores', exist_ok=True)
os.makedirs(f'{BASE_DIR}/05-para-administradores', exist_ok=True)
os.makedirs(f'{BASE_DIR}/06-para-soporte', exist_ok=True)
os.makedirs(f'{BASE_DIR}/07-solucion-de-problemas', exist_ok=True)
os.makedirs(f'{BASE_DIR}/08-preguntas-frecuentes', exist_ok=True)

# 01-introduccion/index.md
with open(f"{BASE_DIR}/01-introduccion/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Bienvenido a Plataforma MEH
sidebar_label: 01. Introducción
---

# Bienvenido a la Plataforma Microsoft Education Hub (MEH)

La Plataforma **Microsoft Education Hub (MEH)** es el ecosistema digital centralizado para la administración de eventos, cursos, acreditaciones y reconocimientos de la comunidad MEH, operando como brazo de extensión de la Carrera de Informática de la Universidad Mayor de San Andrés (UMSA).

Este manual está diseñado para guiarte a través de las funcionalidades del sistema según el rol que desempeñes dentro de la comunidad.

---

## 👥 Roles del Sistema y Niveles de Acceso

La plataforma cuenta con un control de acceso basado en roles (RBAC) que restringe y personaliza la interfaz y las capacidades lógicas del usuario:

| Rol de Usuario | Descripción General | Acciones Clave Permitidas |
| :--- | :--- | :--- |
| **Miembro** | Estudiante o participante regular registrado. | Inscribirse a eventos, subir comprobantes de pago, tomar cursos en el LMS, descargar certificados y coleccionar insignias. |
| **Embajador** | Estudiante destacado del programa *Microsoft Learn Student Ambassadors*. | Acceder a la biblioteca exclusiva VIP de recursos corporativos de Microsoft y plantillas oficiales de oratoria. |
| **Soporte** | Operador auxiliar del equipo de control logístico. | Escaneo rápido de códigos QR en puerta y puntos de control (checkpoints), búsqueda en vivo de alumnos confirmados. |
| **Organizador** | Coordinador académico y logístico del Hub. | Crear eventos, configurar puntos de control, gestionar cursos y lecciones del LMS, estructurar medallas y emitir certificados. |
| **Administrador** | Gestor máster de la plataforma y base de datos. | Alterar roles de usuarios, validación manual de depósitos, conciliación automática por OCR, control de inventario de souvenirs y auditoría forense. |

---

## 🚀 Primeros Pasos

Para comenzar a utilizar la plataforma, debes cumplir con el siguiente flujo básico:
1. **Crear una Cuenta:** Regístrate ingresando a la Landing Page con tu dirección de correo electrónico.
2. **Iniciar Sesión:** Accede al Dashboard utilizando tus credenciales verificadas.
3. **Completar tu Perfil:** Ajusta tu alias, foto y preferencia estética (tema claro u oscuro).
4. **Verificar tu Conectividad:** Si eres parte del personal de Staff, asegúrate de descargar el caché de usuarios confirmados antes de iniciar el control de asistencia offline.

:::info 💡 Nota sobre el Ecosistema
Este manual está estructurado de forma interactiva en Docusaurus. Puedes utilizar la barra de búsqueda superior para encontrar rápidamente comandos, flujos o soluciones a errores comunes del sistema.
:::
""")

# 01-introduccion/roles-permisos.md
with open(f"{BASE_DIR}/01-introduccion/roles-permisos.md", "w", encoding="utf-8") as f:
    f.write("""---
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
""")

# 02-guia-rapida/index.md
with open(f"{BASE_DIR}/02-guia-rapida/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Guía Rápida de Inicio
sidebar_label: 02. Guía Rápida
---

# Guía Rápida de Inicio

Aprende a registrarte, iniciar sesión y configurar tu espacio de trabajo en la Plataforma MEH de manera ágil.

---

## 1. Registro e Inicio de Sesión

### Registro de Nueva Cuenta
1. Ingresa al portal web de la Plataforma MEH.
2. Haz clic en el botón **Registrarse** ubicado en la barra superior de la Landing Page.
3. Completa los campos del formulario:
   * **Nombre Completo:** Tu nombre oficial tal como deseas que figure en tus certificados.
   * **Correo Electrónico:** Dirección de correo institucional (preferible) o personal.
   * **Contraseña:** Mínimo 8 caracteres (almacenada mediante hash seguro Bcrypt).
   * **Confirmar Contraseña:** Validación de correspondencia.
4. Presiona **Crear Cuenta**. Recibirás una notificación visual en pantalla confirmando el registro exitoso.

![Inicio de Sesión (Login)](/img/img_login.png)

### Inicio de Sesión
1. Dirígete a la ruta `/login` o haz clic en **Entrar**.
2. Escribe tu correo electrónico y contraseña.
3. Presiona el botón **Ingresar**.
4. Serás redirigido automáticamente a tu **Dashboard Personal**.

---

## 2. Configuración de Perfil y Preferencias

Una vez dentro de tu Dashboard, puedes configurar tu identidad digital:

1. Haz clic en tu avatar o nombre en la esquina superior derecha y selecciona **Mi Perfil**.
2. **Editar Información Básica:** Puedes actualizar tu alias o foto de perfil.
3. **Preferencias Estéticas (Tema):** Utiliza el selector de tema para cambiar entre el Modo Claro (*Light Theme*) y el Modo Oscuro (*Dark Theme*). La plataforma persistirá esta selección en el almacenamiento local de tu navegador (`localStorage`) para evitar parpadeos visuales indeseados en futuras visitas.
4. **Soporte Multiidioma:** Conmuta entre Español e Inglés instantáneamente utilizando el control de idioma de la barra lateral. Las etiquetas y campos se traducirán dinámicamente mediante el motor `i18next`.

![Mi Perfil y Preferencias](/img/img_perfil.png)

---

## 3. Acceso al Dashboard Central

Una vez autenticado, verás la consola de usuario que resume tu avance:

![Dashboard del Estudiante](/img/img_dashboard_member.png)
""")

# 03-para-miembros/
miembros_docs = {
    "01-eventos.md": ("Explorar Eventos", """# Explorar Eventos

El módulo de Eventos te permite visualizar la agenda académica activa de la comunidad Microsoft Education Hub.

### Paso a Paso para Explorar Eventos:
1. En la barra lateral izquierda, selecciona la sección **Comunidad** y luego haz clic en **Eventos**.
2. Visualizarás una cuadrícula responsiva con las conferencias programadas (como el *Azure Fest* o *Road to Imagine Cup*).
3. Utiliza los filtros de fecha y categoría para encontrar eventos de tu interés.
4. Haz clic en **Ver Detalles** sobre cualquier evento para consultar la agenda horaria, los ponentes asignados y los requisitos de matriculación.

![Explorar Eventos de la Comunidad](/img/img_landing.png)

---

### 📋 Campos Informativos del Evento
* **Título del Evento:** Nombre descriptivo de la actividad.
* **Fecha y Hora:** Horarios de inicio y cierre (UTC-4).
* **Modalidad:** Indica si la asistencia es virtual o física en la facultad.
* **Costo (Bs.):** Monto en bolivianos requerido para el kit o souvenir del evento (si aplica, caso contrario figura como "Gratuito").
"""),
    
    "02-inscripciones.md": ("Inscribirse a Eventos", """# Inscribirse a Eventos

Aprende a registrar tu participación en un evento y a subir tu comprobante de pago si la actividad es de pago.

### Paso a Paso para la Inscripción:
1. En los detalles del evento seleccionado, haz clic en el botón **Inscribirme**.
2. **Si el Evento es Gratuito:** El sistema te inscribirá automáticamente, actualizando tu estado a `'CONFIRMADO'` y generando tu código QR de acceso de forma instantánea.
3. **Si el Evento es de Pago:** Se abrirá una interfaz para cargar tu comprobante de depósito bancario:
   * Realiza la transferencia bancaria al número de cuenta oficial de la comunidad por el monto exacto indicado.
   * Guarda el comprobante digital (PDF o captura de imagen JPG/PNG).
   * Haz clic en **Cargar Comprobante**, introduce el número de transacción bancaria y sube el archivo de imagen.
   * Haz clic en **Enviar Solicitud**.

![Formulario de Inscripción y Voucher](/img/img_formulario_inscripcion.png)

---

### ⚠️ Reglas y Estados de Inscripción
* Tu comprobante de pago pasará por un análisis OCR local. Si es válido y superior a 5 KB, se le asignará una confianza del **98%** y el estado `'VERIFICADO_AUTOMATICO'`, habilitando tu código QR.
* Si el comprobante posee un tamaño inferior o es ilegible, pasará al estado `'REVISION_MANUAL'` para auditoría del administrador.
* **Prohibición Transaccional:** El sistema no admite valores de transacciones duplicados ni montos negativos en el comprobante.
"""),
    
    "03-qr.md": ("Tu QR de Acceso", """# Tu Código QR de Acceso

Tu código QR es tu credencial inalterable para registrar tu asistencia a los eventos presenciales de la comunidad.

### Cómo Obtener y Usar tu QR:
1. Dirígete a tu **Dashboard** personal.
2. En la barra superior, verás una sección destacada con el botón **Mi QR de Acceso**.
3. Haz clic para desplegar una ventana modal que contiene tu código QR generado de forma dinámica y segura.
4. **En la Entrada del Evento:** Presenta la pantalla de tu dispositivo móvil con el código QR para que el personal de staff lo escanee. El escaneo inyectará una marca de tiempo síncrona en PostgreSQL en menos de 50 ms.

![Código QR de Asistencia](/img/img_secuencia_qr.png)

:::tip 💡 Consejo de Uso
Asegúrate de ajustar el brillo de la pantalla de tu móvil al máximo al presentarlo en la puerta de entrada para facilitar la decodificación en ambientes oscuros.
:::
"""),
    
    "04-checkpoints.md": ("Puntos de Control (Checkpoints)", """# Puntos de Control (Checkpoints)

Los checkpoints son puntos de control lógico distribuidos dentro de las conferencias (ej. "Taller React", "Refrigerio", "Charla de Cierre") para validar la permanencia física de los participantes.

### Funcionamiento de los Checkpoints:
1. El personal de staff de la comunidad estará distribuido en distintas áreas del auditorio.
2. Cada vez que cambies de actividad o ingreses a un taller específico, presenta tu QR personal al personal de staff de ese punto.
3. El staff seleccionará el checkpoint correspondiente en su consola offline u online y escaneará tu QR.
4. El sistema inyectará la marca temporal correspondiente en la tabla relacional `asistencia_detalles` de PostgreSQL.
5. Al final del evento, la acumulación exitosa de registros en los checkpoints obligatorios es validada síncronamente para habilitar la descarga de tu certificado de aprobación.

![Historial de Checkpoints de Asistencia](/img/img_checkpoints_list.png)

---

### ❌ Control de Fraude en Puerta
El motor del backend prohíbe los dobles registros o el escaneo múltiple en el mismo checkpoint para evitar el traspaso ilícito de credenciales. Cualquier escaneo duplicado será rechazado arrojando un error visual inmediato.
"""),
    
    "05-cursos.md": ("Tomar Cursos (LMS)", """# Tomar Cursos (LMS)

El Learning Management System (LMS) centraliza la formación curricular de la comunidad Microsoft Education Hub.

### Paso a Paso para Estudiar:
1. En la barra lateral, dirígete al módulo **Learning Hub** (o ruta `/learning`).
2. Visualizarás la biblioteca de cursos activos de la comunidad (ej. *Desarrollo Web con FastAPI*, *Fundamentos de Azure*).
3. Haz clic en **Matricularse** en el curso de tu interés.
4. Selecciona el curso matriculado para ingresar a la vista de clases.
5. La pantalla se dividirá en dos zonas:
   * **Barra de Navegación del Curso:** Listado secuencial de lecciones por módulos.
   * **Reproductor Multimedia:** Video de la clase seleccionada y descripción didáctica.
6. Al finalizar de ver un video, haz clic en **Marcar lección como completada** para guardar tu avance físico en la base de datos relacional.

![Aula Virtual LMS (Learning Hub)](/img/img_learning_hub.png)

---

### 📋 Tareas y Entregas
* Algunos módulos requerirán que realices tareas prácticas.
* En la parte inferior de la lección, encontrarás el botón **Subir Entrega**. Sube tu archivo comprimido o enlace de repositorio.
* Podrás verificar el estado de calificación y comentarios del instructor en el mismo panel una vez evaluada tu entrega.
"""),
    
    "06-certificados.md": ("Descargar Certificados", """# Descargar Certificados

Una vez completados los requisitos de aprobación de un curso o un evento, la plataforma habilitará la descarga de tus diplomas oficiales firmados criptográficamente.

### Cómo Descargar y Validar tu Certificado:
1. Dirígete a la sección **Mis Certificados** de tu Dashboard personal.
2. Si completaste el 100% de las lecciones del curso o cumpliste con los checkpoints del evento, verás habilitado el botón **Descargar PDF**.
3. Haz clic en el botón para exportar tu diploma de alta definición.
4. **Validación de Legitimidad:** Cada certificado incluye en su diseño:
   * Un **Código Hash Criptográfico** de 8 caracteres único e inalterable.
   * Un **Código QR de Verificación**.
5. Cualquiera puede escanear el QR impreso en el PDF para consultar directamente en el backend de la comunidad la autenticidad del documento sin comprometer la base de datos principal.

![Descargar Certificados Académicos](/img/img_mis_certificados.png)

---

### 📋 Errores Comunes de Emisión
Si el botón de descarga aparece inhabilitado, comprueba que:
* Hayas marcado todas las lecciones del curso como completadas.
* Tu pago por kit o souvenir esté en estado `'VERIFICADO_AUTOMATICO'` o `'APROBADO'` (para eventos de pago).
* Tu marca de checkpoint de salida presencial haya sido escaneada exitosamente por el staff en la puerta de egreso.
"""),
    
    "07-badges.md": ("Tus Insignias (Open Badges)", """# Tus Insignias (Open Badges)

El sistema de gamificación de la comunidad MEH premia tu avance técnico mediante insignias digitales compatibles con el estándar de portabilidad *Open Badges*.

### Cómo Visualizar y Compartir tus Logros:
1. Ingresa a la sección **Mis Insignias** (o ruta `/insignias`).
2. Visualizarás tu vitrina virtual de medallas clasificadas por categorías (Logros de Evento, Cursos Aprobados, Hitos de Extensión).
3. Haz clic sobre cualquier medalla desbloqueada para ver sus metadatos detallados (Habilidad certificada, Fecha de otorgamiento, Emisor oficial y firma hash).
4. Puedes descargar la imagen física de la medalla en formato PNG. El archivo lleva inyectado criptográficamente en sus metadatos físicos (PNG chunks) la firma JSON de validez internacional.
5. Puedes enlazar e interoperar tu medalla virtual en redes profesionales como LinkedIn y Twitter para acreditar tus competencias.

![Vitrina de Insignias (Open Badges)](/img/img_vitrina_badges.png)

---

### 🌟 Cómo Desbloquear Medallas
* **Medalla de Iniciación:** Se otorga automáticamente al completar el registro y perfil inicial.
* **Medalla Azure Explorer:** Se desbloquea al asistir al Azure Fest y validar checkpoints.
* **Medalla Core Developer:** Se obtiene al aprobar el curso LMS de FastAPI con nota superior a 90%.
"""),
    
    "08-souvenirs.md": ("Comprar Souvenirs", """# Comprar Souvenirs

Visita la tienda oficial de Microsoft Education Hub para adquirir merchandising, remeras y kits tecnológicos de los eventos.

### Paso a Paso para la Adquisición:
1. En la barra lateral izquierda, selecciona la sección **Comunidad** y luego haz clic en **Tienda de Souvenirs**.
2. Explora el catálogo de productos disponibles con sus precios en Bolivianos (Bs.) y el stock físico en vivo.
3. Haz clic en **Comprar** sobre el producto de tu interés.
4. Se abrirá la pasarela de depósito bancario local:
   * Sube la foto del comprobante de transferencia por el valor exacto del producto.
   * Introduce el número de referencia transaccional.
5. Haz clic en **Finalizar Pedido**.
6. El estado del pedido se actualizará en tu panel financiero y podrás retirar el souvenir en las oficinas del Hub de la facultad una vez que el administrador valide tu depósito bancario.

![Tienda Virtual de Souvenirs](/img/img_tienda_souvenirs.png)

---

### ⚠️ Reglas de Inventario y Stock
* El sistema relacional PostgreSQL tiene restricciones físicas que impiden compras si el stock del producto es inferior a 1.
* Los precios de venta deben ser estrictamente positivos en bolivianos.
"""),
    
    "09-pagos.md": ("Historial de Pagos", """# Historial de Pagos (Mis Finanzas)

El panel financiero te permite auditar y realizar el seguimiento de todos los comprobantes y solicitudes de depósito subidos a la plataforma.

### Cómo Consultar tus Transacciones:
1. En la barra lateral izquierda, haz clic en **Mi Espacio** y selecciona **Mis Finanzas** (ruta `/finanzas`).
2. Se cargará una cuadrícula interactiva con el registro histórico de todas tus operaciones.
3. Cada registro muestra:
   * **Concepto:** Curso o Evento asociado al depósito.
   * **Nro. de Transacción:** Identificador bancario ingresado.
   * **Monto (Bs.):** Monto conciliado.
   * **Fecha de Registro:** Timestamp de auditoría.
   * **Estado de Validación:** Pendiente (`'PENDIENTE'`), Verificado Automático por OCR (`'VERIFICADO_AUTOMATICO'`), Aprobado por Admin (`'APROBADO'`) o Rechazado (`'RECHAZADO'`).

![Historial de Pagos y Finanzas](/img/img_mis_finanzas.png)

---

### 💡 Procedimiento ante Rechazos
Si un depósito es catalogado como `'RECHAZADO'`, verifica que la foto del comprobante sea legible, el número de transacción no esté duplicado y el monto coincida exactamente con el costo del kit, y vuelve a cargar la solicitud.
"""),
    
    "10-academia.md": ("Validar Talento (Academia)", """# Validar Talento (Academia)

El Validador de Talento te permite sincronizar y certificar tus logros académicos oficiales del portal Microsoft Learn dentro de la plataforma local del Hub de la UMSA.

### Paso a Paso para Validar tu Perfil:
1. Dirígete a la sección **Academia** y selecciona **Validador de Talento** (ruta `/validador`).
2. Introduce tu **Alias o ID de Microsoft Learn** público en la caja de texto.
3. Haz clic en el botón **Sincronizar Logros**.
4. El backend se comunicará síncronamente con la API pública de perfiles de Microsoft Learn.
5. El sistema extraerá tus rutas de aprendizaje (*learning paths*) completadas y las traducirá de forma segura en insignias y créditos locales dentro de la Plataforma MEH.
6. El Dashboard se actualizará reflejando tus nuevas medallas.

![Validador de Talento (Microsoft Learn)](/img/img_validador_talento.png)

---

### ❌ Errores de Conexión de Perfil
Si la API devuelve error, comprueba que tu perfil en Microsoft Learn esté configurado como **Público** en los ajustes de privacidad de tu cuenta oficial de Microsoft.
""")
}

for filename, (title, content) in miembros_docs.items():
    with open(f"{BASE_DIR}/03-para-miembros/{filename}", "w", encoding="utf-8") as f:
        f.write(f"---\ntitle: {title}\nsidebar_label: {title}\n---\n\n{content}")

# 04-para-organizadores/index.md
with open(f"{BASE_DIR}/04-para-organizadores/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Manual para Organizadores (Coordinación)
sidebar_label: 04. Para Organizadores
---

# Manual para Organizadores (Coordinación Logística)

Este bloque detalla las operaciones restringidas al personal de organización y coordinadores del Microsoft Education Hub en la UMSA.

---

## 1. Gestión de Eventos y Calendario (CRUD)

1. Ingresa a la consola de administración de eventos en `/dashboard/events-master`.
2. Haz clic en **Crear Nuevo Evento** para abrir el formulario:
   * **Nombre de Evento:** ej. *Azure Fest 2026*.
   * **Descripción y Expositores:** Agenda detallada.
   * **Lugar y Capacidad:** Auditorio de Informática, capacidad física limitada.
   * **Costo (Bs.):** Monto del souvenir/kit.
   * **Switch de Publicación:** Conmuta si el evento es visible para los alumnos.
3. Presiona **Guardar**. La tupla se insertará en PostgreSQL heredando las propiedades de `AuditMixin`.

![Formulario de Creación de Evento](/img/img_crear_evento.png)

---

## 2. Configuración de Checkpoints de Asistencia

1. En los detalles del evento activo, ve a la pestaña **Checkpoints (Puntos de Control)**.
2. Haz clic en **Añadir Checkpoint**.
3. Define un nombre identificador (ej. *Ingreso Mañana*, *Entrega de Kits*, *Cierre*).
4. El sistema generará una fila relacional y habilitará el punto de control para la lectura offline y online.

---

## 3. Escaneo QR e Interfaz en Puerta (Online & Offline)

El escáner QR de puerta opera bajo una interfaz responsiva provista de telemetría de red en vivo:

### Operación Online Standard
1. Dirígete a `/escaneo-qr`.
2. Selecciona el **Checkpoint** activo del listado y otorga permisos de cámara a tu navegador.
3. Enfoca el código QR del asistente. El sistema procesará el token en caliente enviando un request `POST /api/v1/asistencia/scan`.
4. El backend devolverá una alerta verde si la marca es registrada correctamente, o roja si es inválida, duplicada o pertenece a otro evento.

![Consola de Escaneo QR (Soporte/Organizador)](/img/img_escaneo_qr_consola.png)

### Operación Offline-First (Sin Internet)
Si la señal de red en el auditorio es deficiente o nula:
1. **Preparación (Con Internet):** Antes de iniciar la jornada, presiona **Descargar Base de Registrados**. Esto almacenará la nómina en la base de datos de tu navegador (`IndexedDB`).
2. **Activar Modo Desconectado:** La interfaz mostrará la alerta *"Trabajando en modo Offline"*.
3. **Escanear:** El escáner validará localmente contra IndexedDB para prevenir duplicidades. Guardará las marcas en la cola local FIFO (`cola_asistencia`) y dará feedback visual de éxito inmediato.
4. **Sincronización:** Una vez recuperada la conexión de red, presiona **Sincronizar Cola al Servidor**. El frontend subirá los lotes secuencialmente al servidor FastAPI.

---

## 4. Estructura de Cursos y Lecciones LMS

1. Dirígete a `/admin` y selecciona la pestaña **Gestión LMS**.
2. **Crear Curso:** Registra el título, portada y descripción del programa de capacitación.
3. **Añadir Módulos y Lecciones:** Sube el enlace de video de cada clase y su agenda textual.
4. Las lecciones se indexarán de forma secuencial síncrona en PostgreSQL.
""")

# 05-para-administradores/index.md
with open(f"{BASE_DIR}/05-para-administradores/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Manual de Administración (Máster)
sidebar_label: 05. Para Administradores
---

# Manual de Administración (Gestión Máster y Auditoría)

Este bloque documenta las operaciones privilegiadas del Administrador de la plataforma, enfocadas en la seguridad, control financiero y consistencia física de base de datos.

---

## 1. Panel de Control Maestro (Dashboard de Administración)

El administrador cuenta con una consola integrada para supervisar y parametrizar todo el sistema de la comunidad.

![Panel de Control Maestro Administrativo](/img/img_admin_panel.png)

---

## 2. Control de Usuarios y Roles (RBAC)

1. Dirígete a `/admin` y selecciona la pestaña **Usuarios** (o ruta `/dashboard/users`).
2. Visualizarás la cuadrícula interactiva con la nómina de la comunidad.
3. **Cambio de Rol:** Selecciona un usuario y utiliza el menú desplegable para reasignar su rol (`ADMIN`, `ORGANIZADOR`, `MODERADOR`, `SOPORTE`, `EMBAJADOR`, `MIEMBRO`).
4. **Estado de Cuenta:** Utiliza el switch para desactivar o activar una cuenta en vivo, inhabilitando accesos de inmediato.

![Gestión de Usuarios y Roles RBAC](/img/img_gestion_usuarios.png)

---

## 3. Validación de Pagos y Conciliación OCR

La plataforma gestiona los depósitos bancarios de los alumnos combinando visión artificial y reglas de negocio:

### Verificación Manual de Solicitudes
1. Dirígete al panel `/gestion-pagos`.
2. Se listarán los depósitos subidos por los estudiantes.
3. Al hacer clic sobre una fila, la interfaz de Fluent UI v9 desplegará:
   * La **Imagen Física del Comprobante (Voucher)** a la izquierda.
   * Los **Metadatos Extraídos por OCR** (monto, ID de transacción, fecha) a la derecha.
4. Puedes presionar **Aprobar Depósito** (habilitando la matrícula automática al LMS o evento) o **Rechazar Depósito** (solicitando que el alumno vuelva a cargar el voucher).

![Consola de Validación de Pagos (OCR)](/img/img_admin.png)

### Conciliación Bancaria Difusa en Lote
1. Para validar masivamente las transacciones contra la cuenta bancaria de la comunidad, solicita el archivo **CSV de extracto mensual** del banco.
2. Haz clic en **Conciliar Extracto CSV** y sube el archivo.
3. El motor de servicios del backend (`ocrm_service.py`):
   * Cruzará las transacciones por montos equivalentes.
   * Calculará la similitud de nombres de estudiantes mediante el algoritmo **Jaro-Winkler** (umbral de tolerancia difusa del 85%).
   * Evaluará la proximidad en fechas de transacción (ventana temporal de ±3 días).
   * Buscará el ID de pago exacto en la glosa del banco (confianza 100%).
4. El sistema mostrará la tabla de conciliados recomendados (> 60% de confianza) para confirmación masiva del administrador.

![Conciliación Bancaria Difusa en Lote](/img/img_conciliacion_ocr.png)

```mermaid
flowchart TD
    A[Voucher Subido por Alumno] --> B[Motor de OCR Determinístico]
    B -->|PDF/Imagen > 5 KB| C[Confianza 98% - VERIFICADO_AUTOMATICO]
    B -->|Archivo pequeño < 5 KB| D[Confianza 50% - REVISION_MANUAL]
    
    E[Cargar Extracto Bancario CSV] --> F[Motor de Conciliación Bancaria]
    F --> G[Fuzzy Matching Jaro-Winkler de Nombres]
    F --> H[Búsqueda de ID Exacto como Palabra Completa]
    F --> I[Bonus por Ventana Temporal de Fecha ±3 días]
    G & H & I --> J{¿Similitud >= 60.0%?}
    J -->|Sí| K[Emparejar y Autocompletar Conciliación]
    J -->|No| L[Mantener Pendiente]
```

---

## 4. Bitácora de Auditoría Forense (Logs de Sistema)

Para garantizar la seguridad de la información ante manipulaciones internas:

1. Dirígete a la sección de **Auditoría Forense** (ruta `/auditoria`).
2. Se cargará el visor inalterable de logs transaccionales recopilados en la tabla `logs_sistema`.
3. Cada fila detalla:
   * Marca temporal UTC exacta.
   * IP física del emisor HTTP.
   * Identificador del operador involucrado.
   * Tipo de mutación de datos.
   * Un reporte JSON comparativo (*diff*) contrastando los campos anteriores con los nuevos valores modificados.

![Bitácora de Auditoría Forense (Logs)](/img/img_rbac_security.png)
""")

# 06-para-soporte/index.md
with open(f"{BASE_DIR}/06-para-soporte/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Manual para Personal de Soporte
sidebar_label: 06. Para Soporte
---

# Manual para Personal de Soporte (Auxiliares Logísticos)

Este bloque detalla las operaciones para el personal de staff asignado al soporte al cliente y control de incidentes en los eventos de la facultad.

---

## 1. Búsqueda y Verificación en Vivo de Alumnos

Si un alumno se presenta en la puerta de entrada alegando que no puede cargar su QR de acceso:

1. Dirígete a la consola de soporte en `/gestion-pagos` o `/escaneo-qr`.
2. Utiliza la barra de búsqueda en tiempo real e introduce su dirección de correo, nombre completo o número de cédula de identidad.
3. El sistema listará las coincidencias filtrando de forma segura contra la base de datos PostgreSQL.
4. **Verificar el Estado del QR:** Comprueba si el estado de su inscripción figura como `'CONFIRMADO'`:
   * Si figura como `'PENDIENTE'` o `'REVISION_MANUAL'`, dirígete al panel de pagos para verificar físicamente el voucher.
   * Si la transacción bancaria es legítima, solicita al administrador la aprobación manual inmediata en el sistema.

![Consola de Mesa de Soporte](/img/img_consola_soporte.png)

---

## 2. Diagrama de Secuencia del Control de Asistencia QR

A continuación se detalla cómo interactúan los componentes técnicos cuando se realiza el escaneo:

```mermaid
sequenceDiagram
    participant Asistente as Asistente (Miembro)
    participant Soporte as Dispositivo de Soporte
    participant Backend as Backend MEH (FastAPI)
    participant DB as Base de Datos (PostgreSQL)

    Asistente->>Soporte: Presenta Ticket QR en Celular
    Soporte->>Soporte: Captura imagen con cámara (/escaneo-qr)
    Soporte->>Backend: Envía código QR + Event ID (Token JWT)
    Backend->>DB: Verifica inscripción y estado del ticket
    DB-->>Backend: Datos de inscripción encontrados
    alt Registro Válido y Primer Ingreso
        Backend->>DB: Registra timestamp de entrada y activa checkpoint
        Backend-->>Soporte: Respuesta 200 (Acceso Aprobado + Nombre del Alumno)
    else Registro Inválido o Ticket Ya Escaneado
        Backend-->>Soporte: Respuesta 400/404 (Acceso Denegado / Motivo)
    end
```

---

## 3. Diagnóstico de Incidentes de Lectura QR
* Si el escáner del staff devuelve un error de firma criptográfica inválida, solicita al estudiante recargar su Dashboard para refrescar el token QR (los tokens expiran temporalmente por seguridad).
* Si el lector offline no reconoce al estudiante, comprueba que hayas descargado la base de registrados confirmados actualizada más reciente antes del corte de red del recinto.
""")

# 07-solucion-de-problemas/index.md
with open(f"{BASE_DIR}/07-solucion-de-problemas/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Solución de Problemas (Troubleshooting)
sidebar_label: 07. Solución de Problemas
---

# Solución de Problemas (Guía de Incidentes)

Consulta esta guía para diagnosticar y resolver rápidamente los incidentes de red, validación o permisos más comunes de la Plataforma MEH.

---

## 📋 Diagnóstico Rápido de Errores

| Síntoma / Alerta en Pantalla | Causa Probable | Solución de Acción Paso a Paso |
| :--- | :--- | :--- |
| **`401 Unauthorized`** o redirección repentina al Login. | El token Bearer JWT de tu sesión ha expirado (límite de 24 horas por seguridad). | Cierra sesión manualmente en la barra superior y vuelve a ingresar tus credenciales en `/login`. |
| **`403 Forbidden`** al intentar acceder a un módulo. | Tu rol de usuario no posee los permisos RBAC requeridos para el recurso. | Comprueba con el administrador que tu cuenta tenga el rol apropiado asignado en la base de datos. |
| El código QR del alumno sale en rojo como **"No Válido"** en puerta. | El token QR está corrupto, expiró, o el alumno pertenece a un evento diferente. | Solicita al estudiante refrescar su Dashboard (el QR genera un nuevo hash seguro) y verifica el evento seleccionado en el checkpoint. |
| Al subir un voucher bancario, la plataforma arroja **`422 Unprocessable Entity`**. | El número de transacción contiene caracteres especiales inválidos, o el archivo es ilegible. | Asegúrate de introducir solo caracteres alfanuméricos y guiones (`A-Z`, `0-9`, `-`) y de que la imagen sea JPG/PNG. |
| El escáner offline muestra la alerta: **"Error: Base local vacía"**. | El staff no presionó "Descargar Registrados" mientras contaba con acceso a internet. | Conéctate momentáneamente a la red móvil, presiona "Descargar Registrados" en la consola del escáner y vuelve al modo offline. |
| El comprobante digital subido aparece estancado en estado **`REVISION_MANUAL`**. | El archivo posee un tamaño inferior a 5 KB o el OCR no pudo leer el código de transacción. | El equipo administrador validará manualmente el voucher en su panel comparando la imagen física. |

---

## 🛠️ Restablecimiento de Sincronización Bloqueada
Si la cola de sincronización offline (`cola_asistencia` en IndexedDB) se encuentra bloqueada al intentar subir marcas de checkpoints en lote:
1. Asegúrate de tener conexión estable a internet (puedes verificar el indicador de red verde en vivo del escáner).
2. Presiona **Cancelar Sincronización Activa** para liberar el hilo de red.
3. Recarga la pestaña del navegador para limpiar buffers de memoria.
4. Presiona **Sincronizar Cola al Servidor**. El frontend reiniciará la subida FIFO lote por lote de forma segura.
""")

# 08-preguntas-frecuentes/index.md
with open(f"{BASE_DIR}/08-preguntas-frecuentes/index.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Preguntas Frecuentes (FAQ)
sidebar_label: 08. Preguntas Frecuentes
---

# Preguntas Frecuentes (FAQ)

Respuestas a las consultas operacionales y académicas recurrentes en el ecosistema Microsoft Education Hub.

---

### ❓ Consultas Académicas y LMS

#### ¿Cómo apruebo un curso y descargo mi certificado?
Para habilitar el certificado, debes completar el 100% de las lecciones del curso en el Learning Hub y subir las tareas requeridas. Una vez calificado positivamente por el moderador, podrás descargar el PDF desde tu pestaña **Mis Certificados**.

#### ¿Cómo vinculo mi progreso oficial de Microsoft Learn?
Ingresa al módulo **Academia**, selecciona **Validador de Talento**, escribe tu ID o alias público de Microsoft Learn y presiona **Sincronizar**. El backend importará de forma segura tus insignias oficiales y las acreditará en tu vitrina de la plataforma.

---

### ❓ Consultas Financieras y de Pagos

#### ¿Es seguro subir la foto de mi voucher de depósito bancario?
Sí. Los archivos se almacenan en un microservicio de archivos dedicado y la información de la transacción se valida localmente en los servidores de la facultad de Informática de la UMSA, cumpliendo con políticas estrictas de soberanía y privacidad de datos.

#### ¿Qué sucede si el OCR de comprobantes bancarios comete un error?
La plataforma no rechaza automáticamente transacciones basándose solo en el OCR. Si la confianza es menor a 92%, el voucher se marca en estado `'REVISION_MANUAL'`. El administrador del Hub verificará visualmente la imagen del voucher en su panel y aprobará tu matrícula manualmente.

---

### ❓ Consultas de Acreditación (Gamificación)

#### ¿Qué es el estándar Open Badges y para qué sirve?
Las insignias ganadas en el Hub son compatibles con el estándar de portabilidad *Open Badges*. Esto significa que cuando descargas tu medalla en PNG, el archivo lleva cifrado en sus metadatos internos la información del logro, permitiéndote importarlo y validarlo en portales internacionales de empleo como LinkedIn.
""")

# 09-historial-cambios.md (under root docs/usuario/)
with open(f"{BASE_DIR}/09-historial-cambios.md", "w", encoding="utf-8") as f:
    f.write("""---
title: Historial de Cambios del Manual
sidebar_label: Historial de Cambios
---

# Historial de Cambios - Manual de Usuario

| Fecha | Versión | Descripción | Autor |
| :--- | :--- | :--- | :--- |
| 2026-05-19 | 1.0.0 | Generación inicial estructurada del manual en base a la interfaz del sistema. | Nataly Gemio Morales |
| 2026-05-25 | 1.1.0 | **Reestructuración Estética Premium:** Enriquecimiento de flujos para todos los roles, incorporación de tablas de solución de problemas (FAQ/Troubleshooting), alineación con las directrices de la UMSA y marcado visual de capturas requeridas (`:::caution`). | Nataly Gemio Morales |
| 2026-05-25 | 1.2.0 | **Perfeccionamiento del Manual:** Integración de la matriz RBAC completa, diagramas secuenciales de escaneo QR y marcadores/vínculos dinámicos de imágenes Markdown. | Nataly Gemio Morales |
""")

print("Manual de usuario generado con éxito.")
