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

![Formulario de Inscripción y Voucher](/img/img_formulario_inscripcion.png)

---

### ⚠️ Reglas y Estados de Inscripción
* Tu comprobante de pago pasará por un análisis OCR local. Si es válido y superior a 5 KB, se le asignará una confianza del **98%** y el estado `'VERIFICADO_AUTOMATICO'`, habilitando tu código QR.
* Si el comprobante posee un tamaño inferior o es ilegible, pasará al estado `'REVISION_MANUAL'` para auditoría del administrador.
* **Prohibición Transaccional:** El sistema no admite valores de transacciones duplicados ni montos negativos en el comprobante.
