# FEATURE: Integración del Validador de Talentos y Certificados al Sidebar

## 1. Contexto y Objetivos
El objetivo de este feature es integrar el "Validador de Talentos" (Generación y verificación de certificados) al panel principal de navegación (Sidebar) para que sea fácilmente accesible por los usuarios (estudiantes, profesionales) y organizadores. Además de proveer una integración clara y cohesiva en el entorno visual.

## 2. Happy Path
1. El usuario inicia sesión y visualiza el Dashboard (Sidebar).
2. El usuario navega por las secciones y encuentra "Validador de Talentos" dentro de su "Espacio" o "Herramientas" en el Sidebar.
3. El usuario hace clic en "Validador de Talentos".
4. El sistema redirige a `/validador` y el componente de la página se carga sin errores, manteniendo el contexto de la aplicación.

## 3. Sad Paths
1. **Ruta no encontrada:** Si un usuario intenta acceder directamente a `/validador` sin la sesión válida, debería ser redirigido a `/login`.
2. **Falta de componentes visuales:** Si el icono `Certificate24Regular` falla al cargar, el sidebar podría romperse, por lo que se deben importar correctamente desde `@fluentui/react-icons`.

## 4. Reglas de Negocio
- La opción de "Validador de Talentos" debe estar disponible para todos los miembros, ya que es un portal para verificar los logros del estudiante o profesional, y se concatena con cursos y eventos asistidos.
- Las vistas deben respetar el esquema visual del método BMAD y la arquitectura base de Fluent UI.

## 5. CRITERIOS DE ACEPTACIÓN
- [ ] El Sidebar (`frontend/src/components/Sidebar.jsx`) debe incluir el link "Validador de Talentos" apuntando a `/validador`.
- [ ] El ítem debe contener los íconos `Certificate24Regular` y `Certificate24Filled`.
- [ ] El link debe responder visualmente cuando es la ruta activa.
