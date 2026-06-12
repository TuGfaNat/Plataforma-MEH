---
title: Inscribirse a Eventos
sidebar_label: Inscribirse a Eventos
---

# Inscribirse a Eventos

Aprende a registrar tu participación en un evento y a subir tu comprobante de pago si la actividad es de pago.

### Paso a Paso para la Inscripción:
1. En los detalles del evento seleccionado, haz clic en el botón **Inscribirme**.
2. **Si el Evento es Gratuito:** El sistema te inscribirá automáticamente, actualizando tu estado a `'CONFIRMADO'` y generando tu código QR de acceso de forma instantánea.
3. **Si el Evento es de Pago:** Se abrirá una interfaz para cargar tu comprobante de depósito bancario:
   * Realiza la transferencia bancaria al número de cuenta oficial de la comunidad por el monto exacto indicado.
   * Guarda el comprobante digital (PDF o captura de imagen JPG/PNG).
   * Haz clic en **Cargar Comprobante**, introduce el número de transacción bancaria y sube el archivo de imagen.
   * Haz clic en **Enviar Solicitud**.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_formulario_inscripcion.png`  
**Instrucciones de Captura:** Captura del formulario de inscripción para eventos de pago, mostrando las cajas de texto del número de transacción, el botón de subir imagen y los mensajes de validación Fluent UI v9. Guardar la imagen en `website/static/img/img_formulario_inscripcion.png`.
:::

![Formulario de Inscripción y Voucher](/img/img_formulario_inscripcion.png)

---

### ⚠️ Reglas y Estados de Inscripción
* Tu comprobante de pago pasará por un análisis OCR local. Si es válido y legible (confianza >= 95%), se le asignará el estado `'PENDIENTE'`, esperando la conciliación bancaria automatizada para habilitar tu código QR.
* Si el comprobante es de baja confianza o posee un tamaño sospechosamente pequeño, pasará al estado `'REVISION_MANUAL'` para auditoría manual del administrador.
* **Prohibición Transaccional:** El sistema no admite valores de transacciones duplicados ni montos negativos en el comprobante.
