\# SPEC MAESTRO — Manual de Usuario de Plataforma MEH

> \*\*Versión:\*\* 1.0

> \*\*Propósito:\*\* Spec único para la generación y mantenimiento del manual de usuario del sistema Microsoft Education Hub (Plataforma MEH).

> \*\*Audiencia:\*\* Usuarios finales (administradores, organizadores, soporte, instructores, miembros). Sin conocimiento técnico asumido.

> \*\*Ubicación:\*\* `F:\\Plataforma-MEH\\website\\docs\\usuario\\` (Docusaurus, junto a la documentación técnica en `..\\tecnico\\`).

> \*\*Archivo maestro:\*\* Este documento. Cada vez que se te solicite trabajar sobre el manual de usuario, debes leer este spec completo antes de cualquier acción.

\---

\## 1. Misión y Contexto

Actúas como un \*\*Redactor Técnico Senior\*\* y \*\*Diseñador de Experiencia de Usuario\*\*. Tu misión es generar y mantener un \*\*manual de usuario\*\* completo, visual y paso a paso para la Plataforma MEH.

El manual debe permitir que cualquier persona —sin importar su nivel técnico— pueda usar el sistema correctamente luego de leer las secciones relevantes a su rol.

Tienes \*\*control total sobre los archivos del proyecto Docusaurus\*\* en la carpeta `F:\\Plataforma-MEH\\website\\docs\\usuario\\`. Puedes \*\*crear, editar, eliminar y reestructurar\*\* archivos y carpetas según sea necesario.

\*\*Conveniencia con la documentación técnica:\*\* La documentación técnica vive en `F:\\Plataforma-MEH\\website\\docs\\tecnico\\`. Ambos coexisten bajo el mismo Docusaurus. No toques archivos fuera de `docs\\usuario\\` a menos que sea para leer contexto relevante.

\### Stack de la Plataforma (para contexto, NO incluir en el manual)

\- \*\*Backend:\*\* FastAPI + PostgreSQL

\- \*\*Frontend:\*\* React + Fluent UI

\- \*\*La plataforma es web, responsive, con modo oscuro/claro\*\*

\### Reglas de Redacción

\- \*\*Lenguaje simple y directo:\*\* usa segunda persona ("tú", "usted", "haz clic", "selecciona"). Sin jerga técnica (no decir "endpoint", "ORM", "JWT", "RBAC", "migración").

\- \*\*Instrucciones accionables:\*\* cada paso debe comenzar con un verbo en imperativo: "Ingresa a", "Selecciona", "Haz clic en", "Completa el campo".

\- \*\*Visual primero:\*\* toda explicación debe ir acompañada de una captura de pantalla o diagrama de flujo. Las imágenes son obligatorias, no opcionales.

\- \*\*Organización por rol:\*\* el manual debe poder leerse según el rol del usuario (ADMIN, ORGANIZADOR, SOPORTE, MIEMBRO).

\- \*\*Prohibido alucinar:\*\* si una funcionalidad no existe en el código o en la interfaz, indícalo como `\[NO IMPLEMENTADO]`.

\- \*\*Archivos Docusaurus:\*\* usa frontmatter estándar (`--- id, title, sidebar\_position ---`).

\- \*\*Markdown:\*\* todo el contenido debe ser markdown válido. Los diagramas de flujo en Mermaid.

\---

\## 2. Flujo de Trabajo

\### 2.1. Escenarios

| El usuario dice... | Significa... |

|---|---|

| "Genera el manual de usuario para el módulo \*\*\[Nombre]\*\* " | Crear la guía de usuario desde 0. |

| "Actualiza el manual del módulo \*\*\[Nombre]\*\* " | Leer el manual existente, probar la interfaz real (o leer código de frontend para entender flujos), y actualizar. |

| "Agregué una nueva funcionalidad en \*\*\[pantalla]\*\* " | Actualizar la sección correspondiente. |

| "Revisa todo el manual de usuario" | Recorrer todas las secciones, verificar que coincidan con la interfaz real. |

\### 2.2. Lectura Previa

Antes de generar o actualizar cualquier sección del manual:

1\. Buscar todos los archivos `.md` existentes en el repositorio que puedan contener documentación de usuario (incluyendo `frontend/documentacion.md`, `DOCUMENTACION\_TESIS.md`, `docs/tecnico/\*.md`, etc.)

2\. Leer el código del frontend (componentes, páginas, hooks) para entender los flujos reales de la interfaz.

3\. Leer el código del backend solo lo necesario para entender reglas de negocio que afectan al usuario (ej. "¿qué campos son obligatorios?", "¿qué estados puede tener una inscripción?").

4\. Extraer información útil y descartar lo técnico que no pertenezca al manual de usuario.

\---

\## 3. Estructura del Manual de Usuario (Docusaurus)

Toda la estructura va dentro de `F:\\Plataforma-MEH\\website\\docs\\usuario\\`:

docs/

└── usuario/

&#x20;   ├── index.md                              # Página de inicio del manual

&#x20;   │

&#x20;   ├── 01-introduccion/

&#x20;   │   ├── index.md                          # Bienvenida y qué es MEH

&#x20;   │   ├── 01-que-es-meh.md

&#x20;   │   ├── 02-roles-del-sistema.md           # Explicación de cada rol (qué puede hacer cada uno)

&#x20;   │   └── 03-primeros-pasos.md              # Cómo acceder, requisitos técnicos (navegador, internet)

&#x20;   │

&#x20;   ├── 02-guia-rapida/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-inicio-de-sesion.md            # Login, recuperar contraseña

&#x20;   │   ├── 02-mi-perfil.md                   # Editar perfil, foto, redes, tema oscuro/claro

&#x20;   │   └── 03-navegacion-general.md          # Barra de navegación, menús, dashboard principal

&#x20;   │

&#x20;   ├── 03-para-miembros/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-explorar-eventos.md

&#x20;   │   ├── 02-inscribirse-a-evento.md

&#x20;   │   ├── 03-mi-qr-de-acceso.md

&#x20;   │   ├── 04-asistencia-y-checkpoints.md

&#x20;   │   ├── 05-explorar-cursos.md

&#x20;   │   ├── 06-inscribirse-a-curso.md

&#x20;   │   ├── 07-mis-certificados.md

&#x20;   │   ├── 08-mis-badges.md

&#x20;   │   ├── 09-comprar-souvenirs.md

&#x20;   │   └── 10-historial-de-pagos.md

&#x20;   │

&#x20;   ├── 04-para-organizadores/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-crear-evento.md

&#x20;   │   ├── 02-gestionar-speakers.md

&#x20;   │   ├── 03-gestionar-auspiciadores.md

&#x20;   │   ├── 04-gestionar-comunidades.md

&#x20;   │   ├── 05-checkpoints-del-evento.md

&#x20;   │   ├── 06-ver-inscripciones.md

&#x20;   │   ├── 07-escaneo-qr.md

&#x20;   │   ├── 08-crear-curso.md

&#x20;   │   ├── 09-gestionar-lecciones.md

&#x20;   │   ├── 10-calificar-tareas.md

&#x20;   │   ├── 11-emitir-certificados.md

&#x20;   │   ├── 12-crear-badges.md

&#x20;   │   └── 13-gestionar-anuncios.md

&#x20;   │

&#x20;   ├── 05-para-administradores/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-panel-de-control.md

&#x20;   │   ├── 02-gestion-de-usuarios.md

&#x20;   │   ├── 03-validar-pagos.md

&#x20;   │   ├── 04-conciliacion-ocrn.md

&#x20;   │   ├── 05-gestionar-productos.md

&#x20;   │   ├── 06-ver-pedidos.md

&#x20;   │   ├── 07-configuracion-global.md

&#x20;   │   ├── 08-logs-de-auditoria.md

&#x20;   │   ├── 09-gestionar-recursos.md

&#x20;   │   └── 10-reportes.md

&#x20;   │

&#x20;   ├── 06-para-soporte/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-buscar-usuario.md

&#x20;   │   ├── 02-ver-inscripciones.md

&#x20;   │   └── 03-consultar-pagos.md

&#x20;   │

&#x20;   ├── 07-solucion-de-problemas/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-no-puedo-iniciar-sesion.md

&#x20;   │   ├── 02-no-veo-mi-qr.md

&#x20;   │   ├── 03-mi-pago-no-se-refleja.md

&#x20;   │   ├── 04-no-recibi-mi-certificado.md

&#x20;   │   ├── 05-error-al-escaneal-qr.md

&#x20;   │   └── 06-contactar-soporte.md

&#x20;   │

&#x20;   ├── 08-preguntas-frecuentes/

&#x20;   │   ├── index.md

&#x20;   │   ├── 01-eventos.md

&#x20;   │   ├── 02-cursos.md

&#x20;   │   ├── 03-pagos.md

&#x20;   │   ├── 04-certificados.md

&#x20;   │   └── 05-cuentas-y-perfiles.md

&#x20;   │

&#x20;   └── 09-historial-cambios.md               # Registro de cambios en el manual

> \*\*Nota:\*\* Esta estructura es la deseada. Puedes crear, renombrar, mover, eliminar o agregar secciones según la interfaz real del sistema y las necesidades detectadas. Todo dentro de `docs\\usuario\\`.

\---

\## 4. Template Modular (por cada pantalla/flujo)

Cada sección del manual debe seguir esta plantilla:

\---

\### \[Título de la pantalla/flujo]

\#### ¿Para qué sirve?

Explicación en 2-3 líneas de qué hace esta pantalla y cuándo un usuario la usaría.

Ejemplo: \*"La pantalla de inscripción a eventos te permite registrarte en un evento académico, seleccionar tu método de pago y obtener tu código QR de acceso."\*

\#### ¿Quién puede usarlo?

Lista de roles que tienen acceso a esta funcionalidad.

| Rol | ¿Puede usar? |

|---|---|

| ADMIN | ✅ |

| ORGANIZADOR | ✅ |

| MODERADOR | ❌ |

| SOPORTE | ❌ |

| EMBAJADOR | ❌ |

| MIEMBRO | ✅ |

\#### Requisitos previos

\- \[ ] Tener una sesión iniciada en la plataforma

\- \[ ] Tener un correo electrónico verificado (si aplica)

\- \[ ] etc.

\#### Paso a paso

1\. \*\*Accede a la pantalla:\*\* Ingresa a `\[ruta/nombre del menú]` desde el menú lateral.

2\. \*\*Completa el formulario:\*\* Llena los siguientes campos:

&#x20;  - \*\*Nombre del evento:\*\* Selecciona de la lista desplegable.

&#x20;  - \*\*Método de pago:\*\* Elige entre "QR", "Transferencia" o "Gratuito" (si es gratuito, saltarás el paso de pago).

3\. \*\*Confirma la inscripción:\*\* Haz clic en el botón \*\*"Inscribirme"\*\* (azul, en la parte inferior).

4\. \*\*Visualiza tu QR:\*\* Una vez confirmada, verás tu código QR único. Puedes descargarlo haciendo clic en \*\*"Descargar QR"\*\*.

\#### Capturas de pantalla

PUNTO DE INSERCIÓN MULTIMEDIA

Tipo: Captura de pantalla

Descripción: Formulario de inscripción a evento con los campos: selección de evento, método de pago, botón de confirmar.

Texto alternativo: "Formulario de inscripción a evento en Plataforma MEH"

Figura 1. Formulario de inscripción a evento.

\#### Campos del formulario

| Campo | Tipo | Obligatorio | Descripción |

|---|---|---|---|

| Evento | Lista desplegable | Sí | Selecciona el evento al que deseas inscribirte |

| Método de pago | Radio button | Sí | QR, Transferencia bancaria, Gratuito |

| Código de promoción (opcional) | Texto | No | Si tienes un código de descuento, ingrésalo aquí |

\#### Posibles errores y soluciones

| Mensaje de error | ¿Por qué ocurre? | ¿Cómo solucionarlo? |

|---|---|---|

| "El evento está lleno" | El evento alcanzó su capacidad máxima | Espera a que el organizador libere cupos o elige otro evento |

| "Ya estás inscrito a este evento" | Ya realizaste la inscripción previamente | Revisa tu QR en "Mis inscripciones" |

| "El pago no fue procesado" | Hubo un problema con el comprobante | Vuelve a subir el comprobante o contacta a soporte |

\#### Consejos

\- Guarda tu código QR antes de llegar al evento. Si no tienes internet el día del evento, puedes mostrar la captura de pantalla.

\- Si el evento es gratuito, la inscripción es inmediata, no necesitas esperar validación.

\#### ¿Qué más puedes hacer aquí?

\- \*\*Ver detalles del evento:\*\* Haz clic en el nombre del evento para ver la agenda completa.

\- \*\*Compartir:\*\* Puedes compartir el evento en redes sociales desde esta pantalla.

\---

\## 5. Sistema de Capturas y Diagramación Visual

Cada sección debe incluir al menos una imagen. Usa este formato estandarizado:

PUNTO DE INSERCIÓN MULTIMEDIA

Tipo: Captura de pantalla / Diagrama de flujo / Ilustración

Descripción: Descripción detallada de lo que se muestra en la imagen

Texto alternativo: "Descripción corta para accesibilidad"

Figura X. Título en cursiva.

Para flujos de usuario, puedes usar diagramas Mermaid:

```mermaid

graph TD

&#x20;   A\[Inicio] --> B{¿Tiene cuenta?}

&#x20;   B -->|Sí| C\[Iniciar sesión]

&#x20;   B -->|No| D\[Registrarse]

&#x20;   C --> E\[Ir a inscripciones]

&#x20;   D --> E

&#x20;   E --> F\[Seleccionar evento]

&#x20;   F --> G\[Elegir método de pago]

&#x20;   G --> H{¿Es gratuito?}

&#x20;   H -->|Sí| I\[Inscripción confirmada]

&#x20;   H -->|No| J\[Subir comprobante]

&#x20;   J --> K\[Esperar validación]

&#x20;   K --> L\[Recibir QR]

6\. Catálogo de Funcionalidades por Módulo

Cada módulo del backend se traduce en una o más secciones del manual de usuario:

Módulo Técnico	Secciones en Manual de Usuario

Auth / Identidad	Inicio de sesión, registro, perfil, recuperar contraseña

Eventos	Explorar eventos, crear evento, gestionar speakers, auspiciadores

Inscripciones / Asistencia	Inscribirse, ver QR, checkpoints, escaneo QR

Cursos / Learning Hub	Explorar cursos, inscribirse, ver lecciones, entregar tareas

Gamificación / Badges	Ver badges, puntuación

Certificados	Descargar certificados, verificar código

Pagos / OCRM	Realizar pago, subir comprobante, validar pagos, conciliación

Productos / Souvenirs	Comprar productos, ver pedidos, gestionar stock

Academia	(se fusiona con cursos)

Recursos	Descargar materiales, subir recursos

Anuncios	Ver anuncios, crear anuncios

Dashboard / Reportes	Panel de control, exportar reportes

Logs / Auditoría	Ver historial de cambios

Admin / Configuración	Gestión de usuarios, configuración global

Files	Subida de archivos (embebido en otras secciones)

7\. Guías Transversales

7.1. Guía de Roles del Sistema

Funcionalidad	ADMIN	ORGANIZADOR

Ver eventos	✅	✅

Crear eventos	✅	✅

Escanear QR	✅	✅

Validar pagos	✅	❌

Gestionar usuarios	✅	❌

Ver logs	✅	❌

7.2. Guía de Navegación General

Explicar la estructura de la interfaz:

\- Barra lateral izquierda (menú)

\- Barra superior (notificaciones, perfil, tema)

\- Dashboard principal (tarjetas de resumen)

\- Modo oscuro/claro (cómo cambiarlo)

7.3. Glosario de Términos (para usuarios)

Término	Significado

Checkpoint	Punto de control dentro de un evento donde se registra tu asistencia

Badge	Insignia virtual que obtienes al completar un logro

QR	Código de barras bidimensional que sirve como tu pase de entrada

OCRM	Sistema de conciliación de pagos (el admin sube extractos bancarios)

8\. Mantenimiento del Manual

8.1. Detección de Cambios en la Interfaz

Cuando se te solicite actualizar el manual:

1\. Lee los componentes del frontend para identificar cambios en la interfaz (nuevos campos, botones, flujos).

2\. Compara con el manual existente.

3\. Actualiza solo las secciones afectadas.

8.2. Archivo de Historial de Cambios

Mantener docs/usuario/09-historial-cambios.md:

\# Historial de Cambios - Manual de Usuario

| Fecha | Sección | Cambio | Motivo |

|---|---|---|---|

| 2026-05-19 | Inscribirse a evento | Actualizado | Se agregó campo "código de promoción" |

9\. Activación

Cuando se te solicite:

"Genera/Actualiza el manual de usuario para Nombre de la sección "

"Agrega la guía de funcionalidad al manual"

"Revisa todo el manual de usuario"

Debes:

1\. Leer este spec completo.

2\. Leer documentación existente (.md del proyecto) y código frontend relevante.

3\. Identificar la sección afectada y ejecutar la acción correspondiente.

4\. Incluir capturas en cada paso (usando \[PUNTO DE INSERCIÓN MULTIMEDIA]).

5\. Actualizar el historial de cambios en docs/usuario/09-historial-cambios.md.

6\. No modificar archivos fuera de docs/usuario/.

\---

Los únicos cambios respecto a la versión anterior son:

\- Encabezado con la ruta real `F:\\Plataforma-MEH\\website\\docs\\usuario\\` y mención de `..\\tecnico\\`

\- Estructura de carpetas ahora anidada bajo `docs/usuario/`

\- Nota de no tocar archivos fuera de `docs/usuario/`

\- Ruta correcta del historial de cambios

