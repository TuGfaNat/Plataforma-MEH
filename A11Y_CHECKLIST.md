# ♿ A11Y_CHECKLIST.md — Guía y Auditoría de Accesibilidad WCAG 2.1 AA

Plataforma MEH (Microsoft Education Hub)
**Nivel de Conformidad:** WCAG 2.1 Nivel AA (con cumplimiento de Nivel AAA en contraste de texto)
**Fecha:** Septiembre 2026

---

## 1. 📋 Resumen Ejecutivo

Este documento formaliza la auditoría de accesibilidad aplicada al frontend de la **Plataforma MEH**, conforme a los lineamientos internacionales **Web Content Accessibility Guidelines (WCAG) 2.1 Nivel AA**. Se eliminaron fallos históricos del sistema de temas (como la caída del tema `ocean` a `dark`), se integró un tema especializado para usuarios daltónicos (`colorblind`) basado en la paleta **Color Universal Design (CUD - Okabe & Ito)**, y se robusteció el kit de componentes UI con foco visible, atributos ARIA, multi-canalidad de estados y navegación 100% operable por teclado.

---

## 2. 🎨 Matriz de Temas y Ratios de Contraste

Todos los temas disponibles en la plataforma están mapeados en `frontend/src/theme/theme.js` y expuestos de manera configurable en el perfil de usuario (`frontend/src/pages/Configuracion.jsx`).

| Identificador (Key) | Nombre Visual | Propósito / Características | Ratio de Contraste de Texto | Conformidad WCAG |
| :--- | :--- | :--- | :---: | :---: |
| `dark` | **Oscuro** | Tema oficial MLSA por defecto, fondos violáceos y alto contraste. | > 18.2 : 1 | ✅ AAA |
| `light` | **Claro** | Máxima claridad diurna con fondo blanco y elementos definidos. | > 16.5 : 1 | ✅ AAA |
| `blue` | **Blue** | Azul corporativo Microsoft oficial. | > 17.8 : 1 | ✅ AAA |
| `ash` | **Ceniza** | Grises neutros de fatiga visual reducida. | > 14.1 : 1 | ✅ AAA |
| `highContrast` | **Alto Contraste** | Modo de contraste extremo con acento amarillo puro (`#FFFF00`). | > 20.0 : 1 | ✅ AAA |
| `ocean` | **Ocean** | **(Nuevo / Corregido)** Paleta marina profunda (teal/cian/aqua). | **17.68 : 1** | ✅ AAA |
| `colorblind` | **Accesible CUD** | **(Nuevo)** Paleta CUD sin ambigüedad rojo/verde (azul zafiro, cielo y naranja bermellón). | **19.68 : 1** | ✅ AAA |

### 🔍 Detalles Técnicos del Tema `colorblind`:
* **Eliminación de la trampa rojo/verde:** En lugar de semáforos verdes y rojos tradicionales (que se confunden en protanopia y deuteranopia), se emplea **Naranja CUD (`#E69F00`)** para errores y **Azul Cielo CUD (`#56B4E9`)** para estados exitosos.
* **Advertencias:** Se utiliza **Amarillo Oro (`#F0E442`)** con excelente luminancia.
* **Fondo:** `#070B14` (negro azulado profundo) para optimizar el contraste de contornos y bordes.

---

## 3. 🛡️ Principios WCAG 2.1 AA Implementados

### 3.1. Principio 1: Perceptible
* **Criterio 1.1.1 (Contenido no textual):**
  * Todas las imágenes informativas (`<img />`) cuentan con atributos `alt` descriptivos (ej. logotipos institucionales y avatares).
  * Los códigos QR generados dinámicamente (`<QRCodeSVG />` en `Dashboard.jsx` y `EscaneoQR.jsx`) incluyen `role="img"` y un `aria-label` descriptivo indicando el evento o contenido asociado.
* **Criterio 1.4.1 (Uso del color):**
  * **Regla estricta:** Ningún estado (éxito, error, advertencia) depende exclusivamente del color.
  * Los mensajes de error en `MEHInput` incorporan el icono de rechazo `<DismissCircle16Filled />` junto con el texto descriptivo.
  * Los Toasts de notificación en `App.jsx` incluyen iconos específicos por cada nivel de severidad.
* **Criterio 1.4.3 (Contraste mínimo):**
  * Todos los textos y componentes interactivos superan ampliamente el umbral mínimo de 4.5:1 para texto normal y 3:0:1 para elementos gráficos e interactivos.

### 3.2. Principio 2: Operable
* **Criterio 2.1.1 (Teclado):**
  * Toda la funcionalidad de la plataforma es operable mediante teclado estándar (`Tab`, `Shift+Tab`, `Enter`, `Space`, flechas direccionales).
  * Las tarjetas interactivas de temas en `Configuracion.jsx` responden a las teclas `Enter` y `Espacio` con `tabIndex={0}`.
  * El componente de carga de avatar soporta activación por teclado abriendo el selector de archivos nativo.
* **Criterio 2.4.7 (Foco visible):**
  * Indicadores de foco `:focus-visible` homogéneos en todo el kit de UI (`MEHButton`, `MEHInput`, `MEHCard`, tarjetas de tema y contenedores de subida de archivos):
    * Ancho: `2px solid`
    * Color: `tokens.colorStrokeFocus2`
    * Separación: `outline-offset: 2px`
* **Criterio 2.4.4 (Propósito del enlace / botón en contexto):**
  * Botones con solo icono (como el selector de idioma y el botón de ciclado de tema) incorporan `aria-label` y `title` explicativos de la acción y el estado actual.

### 3.3. Principio 3: Comprensible
* **Criterio 3.3.1 (Identificación de errores) y 3.3.2 (Etiquetas o instrucciones):**
  * En `MEHInput`, cada campo cuenta con `<Label htmlFor={inputId}>` asociado de forma única y garantizada (utilizando `useId` de React si no se pasa un id manual).
  * Campos con error exponen `aria-invalid="true"` y `aria-describedby="{inputId}-error"`.
  * Los mensajes de error utilizan `role="alert"` y `aria-live="polite"`.
* **Criterio 3.3.3 (Notificaciones multi-canal):**
  * La función global `notify` en `App.jsx` despacha Toasts con:
    1. Color semántico de severidad.
    2. Icono visual representativo.
    3. Prefijo textual audible para lectores de pantalla (*"Éxito: "*, *"Error: "*, *"Advertencia: "*).
    4. Atributos semánticos: `role="alert"` / `aria-live="assertive"` para errores críticos y `role="status"` / `aria-live="polite"` para confirmaciones.

### 3.4. Principio 4: Robusto
* **Criterio 4.1.2 (Nombre, función, valor):**
  * Contenedor de temas implementado con patrón ARIA `role="radiogroup"` y `role="radio"` con estado dinámico `aria-checked={isSelected}`.
  * Botones en estado de carga exponen `aria-busy="true"` y `aria-disabled="true"`.
  * Spinners de carga identificados con texto de soporte `aria-live="polite"`.

---

## 4. 🧪 Auditoría Aplicada en Páginas Críticas

| Página / Ruta | Componentes Clave Auditados | Mejoras A11Y Aplicadas | Estado |
| :--- | :--- | :--- | :---: |
| **Landing Page** (`/`) | `LandingHeader.jsx`, Botón de tema, Logo | Alt en logotipo, toggle con anuncio de tema actual, `aria-label` en selector de idiomas. | ✅ Conforme |
| **Configuración** (`/configuracion`) | Grid de temas, Subida de avatar, Formulario | 7 temas expuestos con `role="radio"`, navegación por teclado completa, foco visible 2px, avatar clickeable por teclado. | ✅ Conforme |
| **Dashboard** (`/dashboard`) | Diálogo de ticket QR, Tarjetas de evento | `<QRCodeSVG>` con `role="img"` y `aria-label`, foco visible en descarga de tickets, estados sin color-only. | ✅ Conforme |
| **Escaneo QR** (`/escaneo-qr`) | Generador QR, Scanner, Resultados | QR con atributos semánticos, alertas de resultado con icono + texto explícito. | ✅ Conforme |
| **Navegación Global** | `Sidebar.jsx` | Selector de temas cicla los 7 temas con icono y texto localizado, `aria-label` descriptivo, contraste auditado. | ✅ Conforme |
| **Kit UI Compartido** | `MEHButton`, `MEHInput`, `MEHCard` | Focus-visible estandarizado, asociación `htmlFor`, iconos en errores, forwardRef y teclado accesible. | ✅ Conforme |

---

## 5. 🚀 Procedimiento para Agregar Nuevos Temas Accesibles

1. Definir la escala tonal de 16 pasos (de 10 a 160) en `frontend/src/theme/theme.js`.
2. Crear el objeto con `createDarkTheme` o `createLightTheme` asegurando un contraste mínimo de texto superior a **4.5:1** (se recomienda > **7:1**).
3. Registrar la clave en el diccionario `themes` y en `themeMetadata`.
4. La interfaz de `Sidebar`, `LandingHeader` y `Configuracion` adoptará el nuevo tema de forma inmediata y automática con persistencia en el backend del usuario.
