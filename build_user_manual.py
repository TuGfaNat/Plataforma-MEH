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

# 01-introduccion
with open(f"{BASE_DIR}/01-introduccion/index.md", "w", encoding="utf-8") as f:
    f.write("""# Bienvenido a Plataforma MEH

Esta plataforma es el centro digital de la comunidad **Microsoft Education Hub**. Aquí podrás gestionar tu participación en eventos, avanzar en tu formación técnica y conectar con otros profesionales.

## Roles del Sistema

| Rol | Descripción | Permisos Principales |
|---|---|---|
| **Visitante** | Usuario no registrado. | Ver eventos públicos y página de inicio. |
| **Miembro** | Usuario registrado estándar. | Inscribirse a eventos, tomar cursos, obtener certificados. |
| **Embajador** | Miembro destacado. | Acceso a recursos VIP y beneficios exclusivos. |
| **Soporte** | Equipo de ayuda. | Consultar pagos y resolver dudas de usuarios. |
| **Organizador** | Gestor de actividades. | Crear eventos, gestionar lecciones y emitir insignias. |
| **Administrador** | Control total. | Gestión de usuarios, auditoría y configuración global. |

## Primeros Pasos
1. **Regístrate** con tu correo institucional o personal.
2. **Completa tu perfil** con tu alias y foto para que la comunidad te reconozca.
3. **Explora el Landing** para ver las últimas noticias y eventos destacados.
""")

# 02-guia-rapida
with open(f"{BASE_DIR}/02-guia-rapida/index.md", "w", encoding="utf-8") as f:
    f.write("""# Guía Rápida

Aprende a moverte por la plataforma en pocos segundos.

## Inicio de Sesión
1. Ve a la página de **Login**.
2. Ingresa tu correo electrónico y contraseña.
3. Haz clic en el botón de **Entrar**.
![Login Screen](pathname:///img/01-login.png)

## Tu Perfil
1. Haz clic en tu nombre o avatar en la barra superior.
2. Selecciona **Mi Perfil**.
3. Cambia tu foto, bio o alias.
![Perfil](pathname:///img/02-perfil.png)

## Navegación General
Usa la **Barra Lateral** izquierda para acceder a:
- **Dashboard:** Tu resumen personal.
- **Learning Hub:** Tus cursos y progreso.
- **Comunidad:** Directorio y eventos.
- **Recursos VIP:** (Solo para Embajadores).
""")

# 03-para-miembros
secciones_miembros = [
    ("01-eventos.md", "Explorar Eventos", "Ve a la sección Comunidad > Eventos y filtra por fecha."),
    ("02-inscripciones.md", "Inscribirse a Evento", "Selecciona un evento y presiona 'Inscribirme'. Sube tu comprobante si es de pago."),
    ("03-qr.md", "Tu QR de Acceso", "En tu Dashboard, verás un botón 'Mi QR'. Úsalo para entrar al evento."),
    ("04-checkpoints.md", "Puntos de Control", "Escanea los códigos en el evento para validar tu asistencia en tiempo real."),
    ("05-cursos.md", "Tomar Cursos", "Entra al Learning Hub, elige un curso y comienza tus lecciones."),
    ("06-certificados.md", "Descargar Certificados", "Al terminar un curso o evento, descárgalo desde la sección 'Mis Certificados'."),
    ("07-badges.md", "Tus Insignias", "Gana medallas por tus logros. Revísalas en tu perfil público."),
    ("08-souvenirs.md", "Comprar Souvenirs", "Visita la tienda oficial y canjea tus puntos o paga por productos."),
    ("09-pagos.md", "Historial de Pagos", "Revisa el estado de tus comprobantes en la sección 'Mis Finanzas'."),
    ("10-academia.md", "Validar Talento", "Realiza las pruebas de la Academia para certificar tus habilidades técnicas.")
]

for filename, title, desc in secciones_miembros:
    with open(f"{BASE_DIR}/03-para-miembros/{filename}", "w", encoding="utf-8") as f:
        f.write(f"# {title}\\n\\n{desc}\\n\\n![{title}](pathname:///img/placeholder.png)")

# 04-para-organizadores (Resumen de las 13 secciones)
with open(f"{BASE_DIR}/04-para-organizadores/index.md", "w", encoding="utf-8") as f:
    f.write("""# Manual para Organizadores

Gestiona tus actividades de forma eficiente.

1. **Crear Evento:** Llena el formulario en el Panel de Organizador.
2. **Speakers:** Agrega y vincula oradores a tus sesiones.
3. **Auspiciadores:** Gestiona los logos y beneficios de marcas aliadas.
4. **Checkpoints:** Crea puntos de escaneo para medir participación.
5. **Inscripciones:** Revisa quiénes se han anotado a tu actividad.
6. **Escaneo QR:** Usa la cámara para validar entradas en la puerta.
7. **Cursos:** Sube contenido educativo al Learning Hub.
8. **Lecciones:** Organiza tu curso por módulos y temas.
9. **Tareas:** [NO IMPLEMENTADO] - La gestión de entregas está en desarrollo.
10. **Certificados:** Configura la plantilla y gatilla la emisión masiva.
11. **Insignias:** Diseña y otorga medallas por participación destacada.
12. **Anuncios:** Envía notificaciones a todos los inscritos.
13. **Comunidades Aliadas:** Vincula otras organizaciones al evento.
""")

# 05-para-administradores
with open(f"{BASE_DIR}/05-para-administradores/index.md", "w", encoding="utf-8") as f:
    f.write("""# Panel de Administración

Control total sobre la infraestructura de la comunidad.

- **Gestión de Usuarios:** Cambia roles y activa/desactiva cuentas.
- **Validar Pagos:** Revisa manualmente los comprobantes subidos por miembros.
- **Conciliación OCR:** Usa el sistema automático para cruzar datos bancarios.
- **Productos:** Agrega stock a la tienda de souvenirs.
- **Configuración Global:** Ajusta directorios y parámetros del sistema.
- **Logs de Auditoría:** Mira quién hizo qué y cuándo.
- **Gestión de Recursos:** Sube archivos compartidos y kits de prensa.
- **Reportes:** Descarga estadísticas en PDF/Excel.
""")

# 06-para-soporte
with open(f"{BASE_DIR}/06-para-soporte/index.md", "w", encoding="utf-8") as f:
    f.write("""# Guía de Soporte

Ayuda a los miembros a tener una mejor experiencia.

1. **Buscar Usuario:** Localiza a una persona por su correo o alias.
2. **Ver Inscripciones:** Confirma si un usuario está correctamente anotado.
3. **Consultar Pagos:** Verifica si un pago fue rechazado o está pendiente.
""")

# 07-solucion-de-problemas
with open(f"{BASE_DIR}/07-solucion-de-problemas/index.md", "w", encoding="utf-8") as f:
    f.write("""# Solución de Problemas

- **No puedo entrar:** Verifica que tu correo sea el correcto. Usa 'Olvidé mi contraseña'.
- **Mi QR no carga:** Asegúrate de tener conexión a internet. Recarga la página.
- **Pago rechazado:** Revisa que el comprobante sea legible y el monto exacto.
- **Sin Certificado:** Confirma que marcaste todas las lecciones como completadas.
- **Error de Escaneo:** Limpia el lente de tu cámara o aumenta el brillo de la pantalla.
- **Contacto:** Escribe al correo oficial de soporte indicado al pie de página.
""")

# 08-preguntas-frecuentes
with open(f"{BASE_DIR}/08-preguntas-frecuentes/index.md", "w", encoding="utf-8") as f:
    f.write("""# Preguntas Frecuentes

- **¿Los cursos son gratis?** La mayoría sí, algunos especializados requieren ser Embajador.
- **¿Cómo gano insignias?** Participando activamente y completando desafíos técnicos.
- **¿Puedo cambiar mi rol?** Debes solicitarlo al equipo de administración.
""")

# 09-historial-cambios
with open(f"{BASE_DIR}/09-historial-cambios.md", "w", encoding="utf-8") as f:
    f.write("""# Historial de Cambios - Manual de Usuario

| Fecha | Versión | Descripción | Autor |
|---|---|---|---|
| 2026-05-19 | 1.0.0 | Generación inicial basada en la interfaz real del sistema. | Gemini CLI |
""")

print("Manual de usuario generado correctamente.")
