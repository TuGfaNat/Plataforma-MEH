---
id: 10-directorio-red
title: Directorio de Red Ecosistema
sidebar_label: Directorio de Red
---

## 🧭 Visión General del Módulo

El "Directorio de Red" es una herramienta de gestión para los administradores que permite organizar, catalogar y visualizar todas las entidades aliadas de la plataforma MEH, tales como patrocinadores, comunidades asociadas, empresas y universidades conectadas con el hub.

:::security Permisos Requeridos
- **Roles Autorizados:** ADMIN, ORGANIZADOR
- **Scopes Técnicos:** `events.manage` (o equivalente de directorio)
:::

## 🖥️ Interfaz de Usuario (UI) y Elementos Visuales

Se presenta como una base de datos interactiva en forma de rejilla de tarjetas (Cards) o vista de tabla (DataGrid). Permite ver el logo de la entidad, su nivel de participación (Tier de Partnership), y un resumen de las contribuciones realizadas o eventos co-organizados.

![Vista de la Interfaz](./assets/pantallas/10-directorio-red.png)

## 🔄 Flujo de Trabajo Estándar (Paso a Paso)

```mermaid
graph TD
    A[Administrador navega al Directorio] --> B[Aplica filtros];
    B --> C[Busca por "Tipo de Entidad" o "Nombre"];
    C --> D[Visualiza Ficha de Contacto de la Entidad];
    D --> E[Click en "Editar" para actualizar datos];
```

1. **Acción 1:** El organizador accede al módulo de Directorio de Red.
2. **Acción 2:** Utiliza la barra de búsqueda para localizar un aliado específico (ej. "Comunidad Universitaria X").
3. **Acción 3:** Actualiza los datos de contacto o el estado del convenio (activo/inactivo) y guarda los cambios.

:::tip Buenas Prácticas
Mantener este directorio actualizado es clave para el equipo de relaciones públicas y patrocinios. Asegúrate de incluir enlaces a los sitios web oficiales y correos de contacto de los representantes de cada entidad.
:::

## 🛠️ Lógica de Control de Excepciones (Manejo de Errores)

* **¿Qué pasa si ocurre un error al cargar la lista?** Si el servicio de Directorio está temporalmente inactivo, se mostrará una vista de error ("Unable to load directory data") con un botón de recarga, sin afectar la navegación en el resto del Panel de Gestión.
