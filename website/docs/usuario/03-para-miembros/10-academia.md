---
title: Validar Talento (Academia)
sidebar_label: Validar Talento (Academia)
---

# Validar Talento (Academia)

El Validador de Talento te permite sincronizar y certificar tus logros académicos oficiales del portal Microsoft Learn dentro de la plataforma local del Hub de la UMSA.

### Paso a Paso para Validar tu Perfil:
1. Dirígete a la sección **Academia** y selecciona **Validador de Talento** (ruta `/validador`).
2. Introduce tu **Alias o ID de Microsoft Learn** público en la caja de texto.
3. Haz clic en el botón **Sincronizar Logros**.
4. El backend se comunicará síncronamente con la API pública de perfiles de Microsoft Learn.
5. El sistema extraerá tus rutas de aprendizaje (*learning paths*) completadas y las traducirá de forma segura en insignias y créditos locales dentro de la Plataforma MEH.
6. El Dashboard se actualizará reflejando tus nuevas medallas.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_validador_talento.png`  
**Instrucciones de Captura:** Captura de la pantalla del Validador de Talento, mostrando el campo para el ID de Microsoft Learn, el botón de sincronización y la barra de carga de logros en Fluent UI v9. Guardar la imagen en `website/static/img/img_validador_talento.png`.
:::

![Validador de Talento (Microsoft Learn)](/img/img_validador_talento.png)

---

### ❌ Errores de Conexión de Perfil
Si la API devuelve error, comprueba que tu perfil en Microsoft Learn esté configurado como **Público** en los ajustes de privacidad de tu cuenta oficial de Microsoft.
