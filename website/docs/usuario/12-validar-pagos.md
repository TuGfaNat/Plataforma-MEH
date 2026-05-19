---
id: 12-validar-pagos
title: Consola de Validación de Pagos (OCRM)
sidebar_label: Validar Pagos
---

## 🧭 Visión General del Módulo

La "Consola de Validación de Pagos" permite a los roles financieros y de organización auditar y aprobar transacciones manuales (transferencias bancarias, depósitos OCRM). Conecta la inscripción pendiente del usuario con la confirmación real de ingresos en el banco.

:::security Permisos Requeridos
- **Roles Autorizados:** FINANZAS, ADMIN, ORGANIZADOR
- **Scopes Técnicos:** `payments.read_all`, `payments.manage`
:::

## 🖥️ Interfaz de Usuario (UI) y Elementos Visuales

Interfaz de doble panel: del lado izquierdo, una lista de transacciones pendientes ("Cola de Trabajo"). Del lado derecho, el visor del comprobante (PDF o Imagen) subido por el usuario, junto con botones de acción rápida: "Aprobar", "Rechazar" o "Marcar con anomalía".

![Vista de la Interfaz](./assets/pantallas/12-validar-pagos.png)

## 🔄 Flujo de Trabajo Estándar (Paso a Paso)

```mermaid
graph TD
    A[Admin entra a Validar Pagos] --> B[Selecciona un pago pendiente];
    B --> C[Visualiza el comprobante subido];
    C --> D{¿El monto y fecha coinciden?};
    D -- Sí --> E[Click en "Aprobar"];
    D -- No --> F[Click en "Rechazar" + Escribir motivo];
    E --> G[Usuario recibe notificación y entrada al evento];
```

1. **Acción 1:** El auditor abre un ticket de pago pendiente en la consola.
2. **Acción 2:** Revisa visualmente que el comprobante sea válido, legible y corresponda al monto correcto.
3. **Acción 3:** Confirma el pago en la interfaz, lo cual dispara la generación automática de la entrada/factura para el miembro.

:::tip Buenas Prácticas
Intenta procesar la cola de validaciones al menos una vez al día. La rapidez en la validación mejora significativamente la experiencia del usuario, especialmente en los días previos a un evento grande.
:::

## 🛠️ Lógica de Control de Excepciones (Manejo de Errores)

* **¿Qué pasa si el comprobante es falso o ilegible?** El administrador debe usar la opción "Rechazar". El sistema solicitará un "Motivo" (ej. "La imagen está borrosa, por favor sube el PDF del banco"). Este motivo se envía al usuario, quien podrá subir un documento nuevo sin perder su lugar en el evento.
