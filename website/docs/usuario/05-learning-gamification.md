---
id: 05-learning-gamification
title: Learning Hub y Certificaciones
sidebar_label: 05. Centro de Aprendizaje
---

## 🧭 Visión General del Módulo
El **Centro de Aprendizaje** o *Learning Hub* es el repositorio definitivo del conocimiento del usuario. Abarca el seguimiento de Rutas de Aprendizaje (Learning Paths), una galería interactiva de Insignias ganadas y un motor automatizado de generación dinámica de PDF para la emisión de Certificados de conclusión.

:::security Permisos Requeridos
- **Roles Autorizados:** TODOS (MIEMBRO en adelante).
- **Scopes Técnicos:** `learning.read`, `certificates.download`.
:::

## 🖥️ Interfaz de Usuario (UI) y Elementos Visuales
Compuesto por tres pilares visuales:
- **Rutas de Aprendizaje:** Barras de progreso circulares y nodos interconectados (estilo árbol de habilidades).
- **Galería de Insignias:** Grilla interactiva (Grid) de componentes tipo `Card`. Las insignias bloqueadas aparecen en escala de grises. Las desbloqueadas, al hacerles clic, despliegan un *Drawer* lateral con los detalles técnicos del logro.
- **Visor de Diplomas (Modal PDF):** Interfaz emergente que renderiza dinámicamente un documento PDF para pre-visualizar el certificado antes de descargarlo físicamente.

![Vista del Learning Hub](./assets/pantallas/modulo-learning.png)

## 🔄 Flujo de Trabajo Estándar (Paso a Paso)

```mermaid
graph LR
    A[Finalización de Taller] --> B{Validación de Requisitos}
    B -- Cumple Asistencia + Pago --> C[Inyección de Metadata en Base de Datos]
    C --> D[Learning Hub Notifica Nuevo Logro]
    D --> E[Usuario hace clic en 'Ver Certificado']
    E --> F[Renderizado Client-Side (jsPDF)]
    F --> G[Descarga Local de Diploma.pdf]
    B -- Inasistencia --> H[Logro Bloqueado]
```

1. **Acción 1:** El usuario ingresa a la pestaña "Mis Certificados" dentro del Learning Hub.
2. **Acción 2:** Visualiza una lista de talleres finalizados que cumplen con los requisitos de emisión (Pago verificado + QR Escaneado).
3. **Acción 3:** Al presionar "Descargar", el motor `jsPDF` compila en tiempo real un documento de alta calidad inyectando el `uuid_verificacion` del usuario y forzando la descarga en el navegador.

:::tip Buenas Prácticas
Vincula siempre tus Insignias obtenidas en la plataforma MEH con tu perfil de LinkedIn. Puedes usar el UUID de tu certificado para registrarlo en la sección oficial de "Licencias y Certificaciones" de la red social profesional.
:::

## 🛠️ Lógica de Control de Excepciones (Manejo de Errores)
* **¿Qué pasa si mi nombre aparece mal en el certificado?** El motor PDF extrae textualmente los campos "Nombres" y "Apellidos" del perfil. Si hay un error tipográfico, la plataforma bloqueará momentáneamente la edición del nombre y sugerirá abrir un ticket de soporte. Un administrador modificará el registro en la base de datos, lo cual actualizará instantáneamente futuros renders del PDF.
* **¿Qué pasa si el servidor PDF falla?** Como la generación del archivo ocurre *Client-Side* (en el propio navegador), la carga en los servidores es mínima. Si el componente jsPDF falla por librerías incompatibles, un *Boundary Error* atrapará la falla mostrando el aviso: "Tu navegador no soporta renderizado en canvas. Usa Chrome o Edge actualizado."
