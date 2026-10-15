---
title: Historial de Pagos
sidebar_label: Historial de Pagos
---

# Historial de Pagos (Mis Finanzas)

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
