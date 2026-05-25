---
title: Tus Insignias (Open Badges)
sidebar_label: Tus Insignias (Open Badges)
---

# Tus Insignias (Open Badges)

El sistema de gamificación de la comunidad MEH premia tu avance técnico mediante insignias digitales compatibles con el estándar de portabilidad *Open Badges*.

### Cómo Visualizar y Compartir tus Logros:
1. Ingresa a la sección **Mis Insignias** (o ruta `/insignias`).
2. Visualizarás tu vitrina virtual de medallas clasificadas por categorías (Logros de Evento, Cursos Aprobados, Hitos de Extensión).
3. Haz clic sobre cualquier medalla desbloqueada para ver sus metadatos detallados (Habilidad certificada, Fecha de otorgamiento, Emisor oficial y firma hash).
4. Puedes descargar la imagen física de la medalla en formato PNG. El archivo lleva inyectado criptográficamente en sus metadatos físicos (PNG chunks) la firma JSON de validez internacional.
5. Puedes enlazar e interoperar tu medalla virtual en redes profesionales como LinkedIn y Twitter para acreditar tus competencias.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_vitrina_badges.png`  
**Instrucciones de Captura:** Captura de la vitrina de medallas del miembro en Fluent UI v9, mostrando la galería de imágenes SVG de logros desbloqueados y el detalle de metadatos al hacer clic en uno de ellos. Guardar la imagen en `website/static/img/img_vitrina_badges.png`.
:::

![Vitrina de Insignias (Open Badges)](/img/img_vitrina_badges.png)

---

### 🌟 Cómo Desbloquear Medallas
* **Medalla de Iniciación:** Se otorga automáticamente al completar el registro y perfil inicial.
* **Medalla Azure Explorer:** Se desbloquea al asistir al Azure Fest y validar checkpoints.
* **Medalla Core Developer:** Se obtiene al aprobar el curso LMS de FastAPI con nota superior a 90%.
