---
title: Descargar Certificados
sidebar_label: Descargar Certificados
---

# Descargar Certificados

Una vez completados los requisitos de aprobación de un curso o un evento, la plataforma habilitará la descarga de tus diplomas oficiales firmados criptográficamente.

### Cómo Descargar y Validar tu Certificado:
1. Dirígete a la sección **Mis Certificados** de tu Dashboard personal.
2. Si completaste el 100% de las lecciones del curso o cumpliste con los checkpoints del evento, verás habilitado el botón **Descargar PDF**.
3. Haz clic en el botón para exportar tu diploma de alta definición.
4. **Validación de Legitimidad:** Cada certificado incluye en su diseño:
   * Un **Código Hash Criptográfico** de 8 caracteres único e inalterable.
   * Un **Código QR de Verificación**.
5. Cualquiera puede escanear el QR impreso en el PDF para consultar directamente en el backend de la comunidad la autenticidad del documento sin comprometer la base de datos principal.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_mis_certificados.png`  
**Instrucciones de Captura:** Captura de la sección "Mis Certificados" en el Dashboard, listando los diplomas disponibles para descargar y la vista de una tarjeta con el botón de descarga habilitado. Guardar la imagen en `website/static/img/img_mis_certificados.png`.
:::

![Descargar Certificados Académicos](/img/img_mis_certificados.png)

---

### 📋 Errores Comunes de Emisión
Si el botón de descarga aparece inhabilitado, comprueba que:
* Hayas marcado todas las lecciones del curso como completadas.
* Tu pago por kit o souvenir esté en estado `'VERIFICADO_AUTOMATICO'` o `'APROBADO'` (para eventos de pago).
* Tu marca de checkpoint de salida presencial haya sido escaneada exitosamente por el staff en la puerta de egreso.
