---
title: Solución de Problemas (Troubleshooting)
sidebar_label: 07. Solución de Problemas
---

# Solución de Problemas (Guía de Incidentes)

Consulta esta guía para diagnosticar y resolver rápidamente los incidentes de red, validación o permisos más comunes de la Plataforma MEH.

---

## 📋 Diagnóstico Rápido de Errores

| Síntoma / Alerta en Pantalla | Causa Probable | Solución de Acción Paso a Paso |
| :--- | :--- | :--- |
| **`401 Unauthorized`** o redirección repentina al Login. | El token Bearer JWT de tu sesión ha expirado (límite de 24 horas por seguridad). | Cierra sesión manualmente en la barra superior y vuelve a ingresar tus credenciales en `/login`. |
| **`403 Forbidden`** al intentar acceder a un módulo. | Tu rol de usuario no posee los permisos RBAC requeridos para el recurso. | Comprueba con el administrador que tu cuenta tenga el rol apropiado asignado en la base de datos. |
| El código QR del alumno sale en rojo como **"No Válido"** en puerta. | El token QR está corrupto, expiró, o el alumno pertenece a un evento diferente. | Solicita al estudiante refrescar su Dashboard (el QR genera un nuevo hash seguro) y verifica el evento seleccionado en el checkpoint. |
| Al subir un voucher bancario, la plataforma arroja **`422 Unprocessable Entity`**. | El número de transacción contiene caracteres especiales inválidos, o el archivo es ilegible. | Asegúrate de introducir solo caracteres alfanuméricos y guiones (`A-Z`, `0-9`, `-`) y de que la imagen sea JPG/PNG. |
| El escáner offline muestra la alerta: **"Error: Base local vacía"**. | El staff no presionó "Descargar Registrados" mientras contaba con acceso a internet. | Conéctate momentáneamente a la red móvil, presiona "Descargar Registrados" en la consola del escáner y vuelve al modo offline. |
| El comprobante digital subido aparece estancado en estado **`REVISION_MANUAL`**. | El archivo posee un tamaño inferior a 5 KB o el OCR no pudo leer el código de transacción. | El equipo administrador validará manualmente el voucher en su panel comparando la imagen física. |

---

## 🛠️ Restablecimiento de Sincronización Bloqueada
Si la cola de sincronización offline (`cola_asistencia` en IndexedDB) se encuentra bloqueada al intentar subir marcas de checkpoints en lote:
1. Asegúrate de tener conexión estable a internet (puedes verificar el indicador de red verde en vivo del escáner).
2. Presiona **Cancelar Sincronización Activa** para liberar el hilo de red.
3. Recarga la pestaña del navegador para limpiar buffers de memoria.
4. Presiona **Sincronizar Cola al Servidor**. El frontend reiniciará la subida FIFO lote por lote de forma segura.
