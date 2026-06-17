# SPEC MAESTRO — Manual de Usuario de Plataforma MEH

> **Versión:** 2.0 (Definitiva)
> **Propósito:** Spec único para la generación COMPLETA del manual de usuario del sistema Microsoft Education Hub (Plataforma MEH) en UNA SOLA EJECUCIÓN.
> **Audiencia:** Usuarios finales (administradores, organizadores, soporte, instructores, miembros). Sin conocimiento técnico asumido.
> **Ubicación:** `F:\Plataforma-MEH\website\docs\usuario\` (Docusaurus, junto a la documentación técnica en `..\tecnico\`).
> **Archivo maestro:** Este documento. Léelo completo antes de cualquier acción.

---

## ⚠️ ADVERTENCIA CRÍTICA — FUENTES DE INFORMACIÓN

Este manual debe basarse en el código y la interfaz REAL del sistema. NO inventes pantallas, botones o flujos que no existan en el frontend. Tampoco copies texto genérico de manuales de otras plataformas.
| Fuente | Qué contiene | Obligatorio leer |
|---|---|---|
| `docUser.md` (raíz del repo) | Documentación de usuario previa (~16KB) | ✅ Sí |
| `DOCUMENTACION_TESIS.md` (raíz) | Contexto de tesis, descripción del sistema | ✅ Sí |
| `frontend/src/App.jsx` | Rutas exactas (23 rutas definidas) | ✅ Sí |
| `frontend/src/pages/*.jsx` | 24 páginas con formularios, botones, flujos | ✅ Sí |
| `frontend/src/components/*.jsx` | 15 componentes compartidos | ✅ Sí |
| `frontend/src/services/*.js` | 12 servicios API que conectan con backend | ✅ Sí |
| `frontend/src/auth/rbac.js` | Roles y permisos exactos del sistema | ✅ Sí |
| `frontend/src/utils/validators.js` | Validaciones del lado cliente | ✅ Sí |
| `backend/app/models/models.py` | Reglas de negocio (qué campos son obligatorios, estados válidos) | ✅ Contexto |
**Si una funcionalidad no existe en el frontend o backend, márcala como `[NO IMPLEMENTADO]`. No la inventes.**

---

## 1. Misión y Contexto

Actúas como un **Redactor Técnico Senior** y **Diseñador de Experiencia de Usuario**. Tu misión es generar y mantener un **manual de usuario** completo, visual y paso a paso para la Plataforma MEH.
El manual debe permitir que cualquier persona —sin importar su nivel técnico— pueda usar el sistema correctamente luego de leer las secciones relevantes a su rol.
Tienes **control total sobre los archivos del proyecto Docusaurus** en la carpeta `F:\Plataforma-MEH\website\docs\usuario\`. Puedes **crear, editar, eliminar y reestructurar** archivos y carpetas según sea necesario.
**Conveniencia con la documentación técnica:** La documentación técnica vive en `F:\Plataforma-MEH\website\docs\tecnico\`. Ambos coexisten bajo el mismo Docusaurus. No toques archivos fuera de `docs\usuario\` a menos que sea para leer contexto relevante.

### Stack de la Plataforma (para contexto, NO incluir en el manual)

- **Backend:** FastAPI + PostgreSQL
- **Frontend:** React + Fluent UI v9
- **La plataforma es web, responsive, con modo oscuro/claro**

### Reglas de Redacción

- **Lenguaje simple y directo:** usa segunda persona ("tú", "usted", "haz clic", "selecciona"). Sin jerga técnica (no decir "endpoint", "ORM", "JWT", "RBAC", "migración").
- **Instrucciones accionables:** cada paso debe comenzar con un verbo en imperativo: "Ingresa a", "Selecciona", "Haz clic en", "Completa el campo".
- **Visual primero:** toda explicación debe ir acompañada de una captura de pantalla o diagrama de flujo. Las imágenes son obligatorias, no opcionales.
- **Organización por rol:** el manual debe poder leerse según el rol del usuario (ADMIN, ORGANIZADOR, SOPORTE, MIEMBRO).
- **Basado en la interfaz real:** lee los componentes `.jsx` para saber exactamente qué campos, botones y flujos existen. No asumas nada.
- **Prohibido alucinar:** si una funcionalidad no existe en el código o en la interfaz, indícalo como `[NO IMPLEMENTADO]`.
- **Archivos Docusaurus:** usa frontmatter estándar (`--- id, title, sidebar_position ---`).
- **Markdown:** todo el contenido debe ser markdown válido. Los diagramas de flujo en Mermaid.

---

## 2. LECTURA OBLIGATORIA PREVIA

Antes de generar CUALQUIER sección del manual, debes leer:

1. **`docUser.md`** (raíz del repo) — documentación de usuario previa (~16KB)
2. **`DOCUMENTACION_TESIS.md`** (raíz) — contexto de tesis
3. **`frontend/src/App.jsx`** — mapa de rutas exactas y componentes asociados
4. **`frontend/src/pages/`** — cada página que vayas a documentar (su estructura, formularios, botones)
5. **`frontend/src/components/`** — componentes compartidos (Sidebar, modales, etc.)
6. **`frontend/src/services/`** — para entender qué datos viajan al backend
7. **`frontend/src/auth/rbac.js`** — roles y permisos exactos (para la tabla de "¿Quién puede usarlo?")
8. **`frontend/src/utils/validators.js`** — validaciones del lado cliente (regex, campos obligatorios)
   Extrae TODO el contenido relevante de esos archivos. No los ignores. Si un dato documental contradice a la interfaz actual, márcalo como `[DESACTUALIZADO]`.

---

## 3. Escenarios de Activación

| Si el usuario dice...                                       | Significa...                                                                                                                                                                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Genera todo el manual de usuario desde cero"**           | Leer fuentes obligatorias y generar ABSOLUTAMENTE TODO: introducción, guía rápida, secciones por rol (miembros, organizadores, administradores, soporte), solución de problemas, FAQ, e historial de cambios. Un solo pase. |
| "Genera el manual de usuario para la sección **[Nombre]** " | Crear esa sección desde 0.                                                                                                                                                                                                  |
| "Actualiza el manual de la sección **[Nombre]** "           | Leer manual existente, leer frontend real, actualizar diferencias.                                                                                                                                                          |
| "Agregué una nueva funcionalidad en **[pantalla]** "        | Actualizar la sección correspondiente.                                                                                                                                                                                      |
| "Revisa todo el manual de usuario"                          | Recorrer todas las secciones, verificar que coincidan con la interfaz real.                                                                                                                                                 |

---

## 4. Estructura del Manual de Usuario a Generar

docs/usuario/
├── index.md
├── 01-introduccion/
│ ├── index.md
│ ├── 01-que-es-meh.md
│ ├── 02-roles-del-sistema.md
│ └── 03-primeros-pasos.md
├── 02-guia-rapida/
│ ├── index.md
│ ├── 01-inicio-de-sesion.md
│ ├── 02-mi-perfil.md
│ └── 03-navegacion-general.md
├── 03-para-miembros/
│ ├── index.md
│ ├── 01-explorar-eventos.md
│ ├── 02-inscribirse-a-evento.md
│ ├── 03-mi-qr-de-acceso.md
│ ├── 04-asistencia-y-checkpoints.md
│ ├── 05-explorar-cursos.md
│ ├── 06-inscribirse-a-curso.md
│ ├── 07-mis-certificados.md
│ ├── 08-mis-badges.md
│ ├── 09-comprar-souvenirs.md
│ └── 10-historial-de-pagos.md
├── 04-para-organizadores/
│ ├── index.md
│ ├── 01-crear-evento.md
│ ├── 02-gestionar-speakers.md
│ ├── 03-gestionar-auspiciadores.md
│ ├── 04-gestionar-comunidades.md
│ ├── 05-checkpoints-del-evento.md
│ ├── 06-ver-inscripciones.md
│ ├── 07-escaneo-qr.md
│ ├── 08-crear-curso.md
│ ├── 09-gestionar-lecciones.md
│ ├── 10-calificar-tareas.md
│ ├── 11-emitir-certificados.md
│ ├── 12-crear-badges.md
│ └── 13-gestionar-anuncios.md
├── 05-para-administradores/
│ ├── index.md
│ ├── 01-panel-de-control.md
│ ├── 02-gestion-de-usuarios.md
│ ├── 03-validar-pagos.md
│ ├── 04-conciliacion-ocrn.md
│ ├── 05-gestionar-productos.md
│ ├── 06-ver-pedidos.md
│ ├── 07-configuracion-global.md
│ ├── 08-logs-de-auditoria.md
│ ├── 09-gestionar-recursos.md
│ └── 10-reportes.md
├── 06-para-soporte/
│ ├── index.md
│ ├── 01-buscar-usuario.md
│ ├── 02-ver-inscripciones.md
│ └── 03-consultar-pagos.md
├── 07-solucion-de-problemas/
│ ├── index.md
│ ├── 01-no-puedo-iniciar-sesion.md
│ ├── 02-no-veo-mi-qr.md
│ ├── 03-mi-pago-no-se-refleja.md
│ ├── 04-no-recibi-mi-certificado.md
│ ├── 05-error-al-escaneal-qr.md
│ └── 06-contactar-soporte.md
├── 08-preguntas-frecuentes/
│ ├── index.md
│ ├── 01-eventos.md
│ ├── 02-cursos.md
│ ├── 03-pagos.md
│ ├── 04-certificados.md
│ └── 05-cuentas-y-perfiles.md
└── 09-historial-cambios.md

> **Nota:** Puedes crear, renombrar, mover, eliminar o agregar secciones según la interfaz real. Todo dentro de `docs\usuario\`.

---

## 5. Template Modular (por cada pantalla/flujo)

Cada sección debe seguir esta plantilla obligatoriamente:

### [Título de la pantalla/flujo]

#### ¿Para qué sirve?

Explicación en 2-3 líneas de qué hace esta pantalla y cuándo un usuario la usaría.

#### ¿Quién puede usarlo?

Tabla con roles reales del sistema (basados en `frontend/src/auth/rbac.js`):
| Rol | ¿Puede usar? |
|---|---|
| ADMIN | ✅ |
| ORGANIZADOR | ✅ |
| MODERADOR | ❌ |
| SOPORTE | ❌ |
| EMBAJADOR | ❌ |
| MIEMBRO | ✅ |

#### Requisitos previos

- [ ] Tener una sesión iniciada en la plataforma
- [ ] (otros según la funcionalidad)

#### Paso a paso

1. **Accede a la pantalla:** Ingresa a `[ruta/nombre del menú]` desde el menú lateral.
2. **Completa el formulario:** Llena los siguientes campos:
   - **[Campo]:** [tipo de control] — [descripción]
3. **Confirma:** Haz clic en el botón **"[Nombre del botón]"**.
4. **Resultado:** [qué esperar después].

#### Capturas de pantalla

PUNTO DE INSERCIÓN MULTIMEDIA
Tipo: Captura de pantalla
Descripción: qué se ve en la imagen, qué campos y botones
Texto alternativo: "descripción corta"
Figura X. Título en cursiva

#### Campos del formulario

| Campo   | Tipo                | Obligatorio | Descripción   |
| ------- | ------------------- | ----------- | ------------- |
| [campo] | [lista/radio/texto] | Sí/No       | [descripción] |

#### Posibles errores y soluciones

| Mensaje de error | ¿Por qué ocurre? | ¿Cómo solucionarlo? |
| ---------------- | ---------------- | ------------------- |
| [mensaje]        | [causa]          | [solución]          |

#### Consejos

- [consejo útil para el usuario]

#### ¿Qué más puedes hacer aquí?

- **[Acción]:** [descripción]

---

## 6. Sistema de Capturas y Diagramación Visual

Cada sección debe incluir al menos una imagen:
PUNTO DE INSERCIÓN MULTIMEDIA
Tipo: Captura de pantalla / Diagrama de flujo / Ilustración
Descripción: descripción detallada
Texto alternativo: "descripción corta"
Figura X. Título en cursiva
Para flujos de usuario, usa Mermaid:

```mermaid
graph TD
    A[Inicio] --> B{¿Tiene cuenta?}
    B -->|Sí| C[Iniciar sesión]
    B -->|No| D[Registrarse]
7. Catálogo de Funcionalidades por Módulo
Cada módulo técnico se traduce en estas secciones del manual:
Módulo Técnico	Secciones en Manual de Usuario
Auth / Identidad	Inicio de sesión, registro, perfil, recuperar contraseña
Eventos	Explorar eventos, crear evento, gestionar speakers, auspiciadores
Inscripciones / Asistencia	Inscribirse, ver QR, checkpoints, escaneo QR
Cursos / Learning Hub	Explorar cursos, inscribirse, ver lecciones, entregar tareas
Gamificación / Badges	Ver badges, puntuación
Certificados	Descargar certificados, verificar código
Pagos / OCRM	Realizar pago, subir comprobante, validar pagos (admin), conciliación (admin)
Productos / Souvenirs	Comprar productos, ver pedidos, gestionar stock (admin)
Academia	(fusionado con cursos)
Recursos	Descargar materiales, subir recursos (admin)
Anuncios	Ver anuncios, crear anuncios (admin)
Dashboard / Reportes	Panel de control, exportar reportes
Logs / Auditoría	Ver historial de cambios (admin)
Admin / Configuración	Gestión de usuarios, configuración global
Files	Subida de archivos (embebido en otras secciones)
Monitoreo y Carga	Visualización de dashboards Grafana (admin), ejecución de scripts k6
8. Guías Transversales
8.1. Guía de Roles del Sistema
Según frontend/src/auth/rbac.js:
Funcionalidad	ADMIN	ORGANIZADOR
Ver eventos	✅	✅
Crear eventos	✅	✅
Escanear QR	✅	✅
Validar pagos	✅	❌
Gestionar usuarios	✅	❌
Ver logs	✅	❌
8.2. Guía de Navegación General
- Barra lateral izquierda (menú principal)
- Barra superior (notificaciones, perfil, tema oscuro/claro)
- Dashboard principal (tarjetas de resumen)
- Cómo cambiar entre modo oscuro y claro
8.3. Glosario de Términos
Término	Significado
Checkpoint	Punto de control dentro de un evento donde se registra tu asistencia
Badge	Insignia virtual que obtienes al completar un logro
QR	Código de barras bidimensional que sirve como tu pase de entrada
OCRM	Sistema de conciliación de pagos (el admin sube extractos bancarios)

8.4. Guía de Monitoreo y Pruebas de Carga para Administradores
*   **Acceso al Dashboard de Grafana:** El administrador puede acceder a la interfaz de monitoreo en tiempo real ingresando a la URL `http://localhost:3001` desde el navegador. El dashboard de control consolidado expone latencias por endpoint, RPS, tasa de errores y conexiones PostgreSQL.
*   **Ejecución de Pruebas de Carga (k6):** Para simular la concurrencia masiva del programa de embajadores, ejecute el script k6 desde la terminal en la raíz del proyecto usando el comando:
    `k6 run tests/k6_load_test.js`
    Esto simulará de forma secuencial los escenarios local (200 usuarios), regional (1.000 usuarios) y global (5.000 usuarios), y reportará el throughput y tiempos de respuesta directo en la consola y en el dashboard de Grafana.

9. Mantenimiento del Manual
9.1. Archivo de Historial de Cambios
Mantener docs/usuario/09-historial-cambios.md:
# Historial de Cambios - Manual de Usuario
| Fecha | Sección | Cambio | Motivo |
|---|---|---|---|
| 2026-05-19 | [sección] | [creación/actualización] | [motivo] |
9.2. Detección de Cambios
Al actualizar: leer frontend real, comparar con manual, corregir solo diferencias.
10. Activación
Cuando se te solicite:
"Genera todo el manual de usuario desde cero"
Debes:
1. Leer este spec completo.
2. Leer docUser.md, DOCUMENTACION_TESIS.md, y TODO el frontend (App.jsx, pages/, components/, services/, auth/rbac.js, utils/validators.js).
3. Leer backend solo para contexto de reglas de negocio.
4. Generar la estructura COMPLETA en docs/usuario/ de un solo pase (introducción, guía rápida, 4 secciones por rol, solución de problemas, FAQ, historial).
5. Cada sección con template completo: para qué sirve, quién puede usarlo, requisitos, paso a paso, capturas, campos, errores, consejos.
6. Incluir [PUNTO DE INSERCIÓN MULTIMEDIA] en cada paso.
7. No modificar archivos fuera de docs/usuario/.
8. No preguntar nada. Solo ejecutar.
```
