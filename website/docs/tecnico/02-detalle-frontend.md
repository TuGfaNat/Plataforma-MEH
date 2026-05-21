---
title: Arquitectura Interna del Frontend
sidebar_label: 02. Detalle de Frontend React
---

# Arquitectura Interna del Frontend (React 18 & Fluent UI v9)

El frontend de la Plataforma MEH está diseñado como una **Single Page Application (SPA)** de alto rendimiento que se ejecuta del lado del cliente. Se ha implementado utilizando **React 18 con JSX estándar** (sin TypeScript) y el sistema de empaquetado ultra-rápido **Vite**, maximizando la velocidad de compilación y optimizando los tiempos de recarga en caliente del navegador (HMR).

---

## 1. Sistema de Estilos y UI: Fluent UI v9 (Griffel)

La estética visual de la plataforma sigue estrictamente el sistema de diseño oficial de Microsoft, **Fluent UI v9** (`@fluentui/react-components`). A diferencia de otros frameworks tradicionales (como Bootstrap o Tailwind), Fluent UI v9 adopta una arquitectura de estilos de última generación basada en **CSS-in-JS** a través del motor **Griffel**.

### Características del Sistema de Estilos:
1. **Compilación Dinámica y Optimización de CSS:** Los estilos se declaran utilizando el hook `makeStyles`. Griffel procesa estas declaraciones al momento de compilar y las inyecta dinámicamente como clases CSS atómicas en la cabecera del documento HTML, previniendo la inyección innecesaria de clases duplicadas.
2. **Uso Exclusivo de Tokens de Diseño:** Toda la gama de colores, espaciados y tipografías se extrae de los tokens semánticos nativos de Microsoft (`tokens.colorNeutralBackground1`, `tokens.spacingHorizontalM`, etc.). Esto garantiza la consistencia del lenguaje visual en todas las resoluciones y temas.
3. **Persistencia del Tema Visual (Context API):** Fluent UI v9 implementa el componente `FluentProvider` que recibe un objeto de tema (`webDarkTheme` o `webLightTheme`). La plataforma envuelve a toda la aplicación con este proveedor, y la preferencia del usuario se propaga a través de un `ThemeContext` que persiste la selección en el almacenamiento local (`localStorage`) para que el tema se mantenga activo en futuras sesiones.

### Ejemplo Técnico Real de Estilos con `makeStyles`:

```javascript
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    ...shorthands.padding(tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    boxShadow: tokens.shadow4,
    transition: 'transform 0.2s ease-in-out',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow8,
    }
  },
  titleText: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForegroundLink,
  }
});
```

---

## 2. Enrutamiento y Protección de Rutas (React Router v6)

El control de la navegación en el cliente está a cargo de **React Router v6**. Se han implementado dos mecanismos fundamentales para la seguridad de la aplicación:

1. **Layouts de Navegación Consistentes:** La aplicación define un layout maestro protegido que incluye componentes globales como la barra lateral interactiva (`Sidebar.jsx`) y el encabezado de perfil, permitiendo que la navegación del usuario sea fluida sin parpadeos de recarga completa.
2. **Guardias de Ruta por Roles (RBAC):** Las vistas administrativas y logísticas están protegidas por componentes guardias (`ProtectedRoute`) que evalúan el token del usuario en sesión (`AuthContext`). Si el rol del usuario no tiene los privilegios requeridos (ej. un `Miembro` intentando acceder a `/admin`), la guardia intercepta la navegación y redirige automáticamente al usuario a su dashboard principal, arrojando una alerta visual.

---

## 3. Consumo de la API con Axios e Interceptores Centralizados

Toda la comunicación de datos hacia el backend de FastAPI se realiza de forma centralizada utilizando la librería **Axios** instanciada en `frontend/src/services/api.js`.

### El Rol de los Interceptores de Axios:
Para evitar la inyección manual de encabezados de seguridad en cada llamada de Axios, se han configurado interceptores de solicitud y respuesta a nivel global:

* **Interceptor de Solicitud (Request Interceptor):** Intercepta de forma automática cada petición HTTP saliente. Extrae el Token JWT de seguridad guardado en el storage del navegador y lo adjunta síncronamente en los encabezados HTTP bajo el formato estándar `Authorization: Bearer <TOKEN>`.
* **Interceptor de Respuesta (Response Interceptor):** Monitorea cada respuesta entrante del servidor. Si el backend retorna un código de error de seguridad (por ejemplo, `HTTP 401 Unauthorized` indicando que el token ha expirado), el interceptor captura la excepción, destruye la sesión en el `AuthContext` del frontend, borra los datos persistidos y redirige de forma inmediata al usuario a la pantalla de `/login` para resguardar la seguridad de la cuenta.

---

## 4. Internacionalización y Traducción Dinámica (i18n)

Para cumplir con las exigencias académicas y permitir un despliegue internacional, la interfaz incluye soporte multiidioma (español e inglés) administrado a través del archivo centralizado `frontend/src/i18n.js`. 

Este módulo carga diccionarios en formato JSON para cada idioma y proporciona el hook reactivo `useTranslation()`, permitiendo traducir al vuelo etiquetas de texto, encabezados de tablas, e íconos sin alterar la velocidad de pintado de componentes ni forzar refrescos en el navegador.
