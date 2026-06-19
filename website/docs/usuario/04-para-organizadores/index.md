---
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
