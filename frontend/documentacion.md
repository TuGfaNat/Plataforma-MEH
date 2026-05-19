\# 📘 SPEC: MANUAL DE USUARIO COMPONENTE-BASE (DOCUSAURUS INTEGRATION)



\## 1. OBJETIVO Y METODOLOGÍA

Esta Spec define la estructura, componentes, densidad de información y diseño visual que debe tener el \*\*Manual de Usuario\*\* dentro del sitio de Docusaurus de la plataforma MEH. 

La documentación se dividirá estrictamente \*\*por componentes del Sidebar\*\*, reflejando fielmente la interfaz construida en Fluent UI v9 y la lógica relacional del Backend (FastAPI).
Analizando la documentación que ya existe y la manera ne la que se creo solamente es cuestión de modificar y crear nuevos componentes.




\---



\## 2. REGLAS DE DISEÑO EN DOCUSAURUS

* importante, en el caso de que el sidebar haya cambiado o vayua a cambiar hace r un escaneo rápido y por cada modulo o tab que tenga sacar un componente de documentación y explicarlo muy a detalle según las siguientes reglas 

\### \*\*A. Componentes Interactivos (Admonitions)\*\*

Para enriquecer la lectura y segmentar la información según el rol, cada sección del manual utilizará:

\* `:::info` Para describir el propósito del módulo o componente técnico de la UI.

\* `:::tip` Para guiar el flujo de interacción estándar ("Cómo hacer X cosa").

\* `:::security` \[Custom badge] Para especificar qué permisos del RBAC (`events.manage`, `attendance.scan`) se requieren para ver o accionar ese componente.

\* `:::warning` Para alertar sobre flujos de excepción (ej: "Si el pago es rechazado...").



\### \*\*B. Formato de Contenido de Alto Impacto\*\*

\* \*\*Diagramas de Flujo (Mermaid):\*\* Cada componente complejo debe incluir un bloque ` ```mermaid ` que ilustre visualmente la lógica del proceso del lado del usuario.

\* \*\*Estructura de Capturas:\*\* Indicar explícitamente los placeholders de imágenes utilizando el formato estándar: `!\[Descripción de la Interfaz](./assets/pantallas/modulo-xyz.png)`.



\---



\## 3. MAPA DETALLADO DEL SIDEBAR (ESTRUCTURA DE ARCHIVOS)



El manual se compondrá de los siguientes archivos `.md` estructurados de forma atómica:



\### 📁 `docs/user-manual/`



\#### 📄 `01-onboarding-auth.md` (Módulo de Acceso y Perfil)

\* \*\*Enfoque de UI:\*\* Formulario de Login, Registro ("Comenzar mi viaje") y Recuperación de Contraseña (`/forgot-password`).

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Formulario de Registro:\*\* Distribución limpia de los campos (Nombres, Apellidos, Correo, Contraseña). Reglas de validación en caliente (longitudes, restricción de caracteres).

&#x20;   2.  \*\*Pantalla de Perfil de Miembro:\*\* Configuración de preferencias (Tema Oscuro/Claro persistente), bio, alias y redes sociales asociadas (vínculo a la tabla `usuarios`).

&#x20;   3.  \*\*Visualización de Puntos y Rangos:\*\* Panel de estado actual en el sistema de gamificación.



\#### 📄 `02-dashboard-central.md` (Módulo del Panel Principal)

\* \*\*Enfoque de UI:\*\* Contenedor adaptativo (Desktop/Mobile) con Widgets de resumen.

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Cards Estadísticas:\*\* Lógica de visualización condicionada por Rol. El `SuperAdmin` visualiza "Usuarios Totales" e "Ingresos", el `Miembro` visualiza su "Progreso" e "Insignias Próximas".

&#x20;   2.  \*\*Barra de Progreso y Próximo Hito:\*\* Diseño del componente dinámico que calcula la brecha del usuario hacia el siguiente nivel (ej: "Faltan 2 talleres para el rango Explorer").

&#x20;   3.  \*\*Muro de Avisos Comunitario:\*\* Sección de visualización de noticias y circulares oficiales del Hub.



\#### 📄 `03-events-hub.md` (Gestión Operativa de Eventos y OCRM)

\* \*\*Enfoque de UI:\*\* Grid de Eventos, Modales de Inscripción y Pasarela OCRM.

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Explorador de Eventos:\*\* Filtros avanzados por Modalidad (Virtual/Presencial/Híbrido) y Categoría.

&#x20;   2.  \*\*Modal de Inscripción con Selección de Paquetes:\*\* Interfaz interactiva para elegir Tiers de entradas (Estudiante, Profesional, Comunidad).

&#x20;   3.  \*\*Pasarela OCRM (Flujo de Pago):\*\* Renderizado de QR Bancario estático, campo de carga del comprobante transaccional (`comprobante\_url`), y ciclo de vida del estado ("Pendiente de Verificación").



\#### 📄 `04-qr-operations.md` (Centro de Control de Asistencia Física)

\* \*\*Enfoque de UI:\*\* Lector de cámara integrado (`html5-qrcode`) y visualizador de tickets.

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Mi Ticket QR:\*\* Interfaz móvil del miembro donde se genera y renderiza el token de autenticidad único para el evento.

&#x20;   2.  \*\*Escáner del Organizador/Moderador:\*\* Interfaz de control de acceso que abre la cámara web/móvil, lee el token, realiza el "Check-in/Check-out" y actualiza las tablas `checkpoints` y `asistencia\_detalles` en tiempo real sin recargar pantalla.



\#### 📄 `05-learning-gamification.md` (Learning Hub, Insignias y Certificaciones)

\* \*\*Enfoque de UI:\*\* Visores de rutas académicas, Galería de Logros y Modales de PDF.

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Rutas de Aprendizaje (Microsoft Learning):\*\* Sincronización visual de cursos completados mediante el mapeo de `uid\_ms`.

&#x20;   2.  \*\*Galería de Insignias Interactiva:\*\* Grid de insignias ganadas (tabla `usuarios\_badges`). Al hacer clic en un ítem, abre un Drawer lateral con los detalles del logro y fecha de emisión.

&#x20;   3.  \*\*Descarga Automática de Certificados:\*\* Lógica del botón de descarga habilitado por el cumplimiento de condiciones (`asistencia === true \&\& pago\_estado === 'PAGADO'`). Renderizado dinámico de la plantilla PDF con `uuid\_verificacion`.



\#### 📄 `06-admin-master-panel.md` (Panel de Control Avanzado y Auditoría Suprema)

\* \*\*Enfoque de UI:\*\* Tablas de administración de alta densidad y consolas de carga de archivos.

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Consola OCRM (Conciliación Bancaria):\*\* Interfaz para arrastrar y soltar (Dropzone) el extracto bancario en CSV/Excel. Visualizador de emparejamientos inteligentes sugeridos por el Backend.

&#x20;   2.  \*\*Creador de Eventos e Insignias:\*\* Formulario maestro del administrador para inyectar multimedia, fechas, capacidades y asociar `speakers` o comunidades aliadas.

&#x20;   3.  \*\*Auditoría Suprema (Logs del Sistema):\*\* Tabla interactiva con scroll horizontal optimizado que consume los registros del `AuditMixin`. Muestra el historial completo: Autor de la acción, Tipo de operación, Valor Anterior vs Valor Nuevo, y Timestamp.



\#### 📄 `07-public-validator.md` (Validador de Talento Público)

\* \*\*Enfoque de UI:\*\* Landing page pública y externa de validación de credenciales.

\* \*\*Estructura Interna:\*\*

&#x20;   1.  \*\*Formulario de Verificación:\*\* Input limpio para ingresar el `codigo\_verificacion` o el UUID del certificado emitido por el MEH.

&#x20;   2.  \*\*Ficha de Legitimidad:\*\* Renderizado de la confirmación directa desde la base de datos confirmando la autenticidad del documento, el nombre del estudiante y el alcance del curso.



\---



\## 4. PLANTILLA BASE REUTILIZABLE POR COMPONENTE (MANDATORIA)

Cada uno de los archivos `.md` listados anteriormente \*\*debe\*\* comenzar con la siguiente estructura de cabecera y secciones:



```markdown

\---

id: \[nombre-del-componente]

title: \[Título Formal del Módulo]

sidebar\_label: \[Nombre Corto para el Sidebar]

\---



\## 🧭 Visión General del Módulo

\[Breve párrafo formal que explique qué problema resuelve este componente de la plataforma]



:::security Permisos Requeridos

\- \*\*Roles Autorizados:\*\* \[ADMIN / ORGANIZADOR / MIEMBRO, etc.]

\- \*\*Scopes Técnicos:\*\* `\[nombre\_del\_scope.action]`

:::



\## 🖥️ Interfaz de Usuario (UI) y Elementos Visuales

\[Descripción de la pantalla basándose en los componentes de Fluent UI v9 utilizados, inputs, botones y áreas de visualización]



!\[Vista de la Interfaz](./assets/pantallas/placeholder.png)



\## 🔄 Flujo de Trabajo Estándar (Paso a Paso)

1\. \*\*Acción 1:\*\* \[Paso inicial]

2\. \*\*Acción 2:\*\* \[Procesamiento]

3\. \*\*Acción 3:\*\* \[Resultado final obtenido]



:::tip Buenas Prácticas

\[Consejo técnico de uso para el usuario u organizador]

:::



\## 🛠️ Lógica de Control de Excepciones (Manejo de Errores)

\* \*\*¿Qué pasa si \[Caso de error]?\*\* \[Explicación de cómo el sistema maneja el flujo alterno para evitar la caída de la UI]

