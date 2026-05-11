# CUERPO DE TESIS: PLATAFORMA MEH (MICROSOFT ENTHUSIAST HUB)

**Postulante:** [Tu Nombre]  
**Institución:** Universidad Mayor de San Andrés (UMSA)  
**Facultad:** Ciencias Puras y Naturales  

---

## RESUMEN EJECUTIVO
El presente proyecto de grado describe el diseño e implementación de una plataforma integral para la gestión de comunidades tecnológicas, denominada "Microsoft Enthusiast Hub". El sistema resuelve la problemática de la gestión manual de asistencias, emisión de certificados y control financiero en eventos académicos mediante una arquitectura moderna de microservicios, seguridad avanzada y auditoría total.

---

## CAPÍTULO 1: METODOLOGÍA DE DESARROLLO

### 1.1. Metodología Agile: Feature-Driven Development (FDD)
Se ha seleccionado **FDD** por su enfoque en la entrega de resultados tangibles y su capacidad para gestionar proyectos orientados a objetos. El ciclo de desarrollo se dividió en cinco etapas:
1.  **Modelo Global:** Definición del esquema Entidad-Relación y dominios del sistema.
2.  **Lista de Funcionalidades:** Desglose del sistema en +50 features de negocio (ej: "Validar token QR", "Emisión de Diploma PDF").
3.  **Planificación:** Sprints de 15 días priorizando el módulo de Autenticación y RBAC.
4.  **Diseño:** Creación de especificaciones SDD (Software Design Documents) por cada feature crítica.
5.  **Construcción:** Implementación iterativa con pruebas unitarias integradas.

### 1.2. Validación BMAD (Agile AI-Driven)
Se integró el protocolo **BMAD** para la validación de requerimientos en tiempo real, utilizando agentes inteligentes para realizar auditorías de código (QA), detección de brechas de seguridad y generación de casos de prueba automáticos, asegurando un software libre de errores críticos antes del despliegue.

---

## CAPÍTULO 2: INGENIERÍA Y ARQUITECTURA

### 2.1. Arquitectura de Software
El sistema implementa una **Arquitectura Cliente-Servidor Desacoplada**:
*   **Capa de Presentación:** Frontend reactivo utilizando React.js y el sistema de diseño Fluent UI de Microsoft, garantizando accesibilidad y estética profesional.
*   **Capa de Lógica de Negocio:** API RESTful construida con FastAPI, aprovechando el tipado estático de Python 3.11 para reducir errores en tiempo de ejecución.
*   **Capa de Datos:** PostgreSQL con SQLAlchemy, implementando un motor de auditoría universal (`AuditMixin`) que registra la trazabilidad de cada transacción.

### 2.2. Seguridad y Control de Acceso (RBAC)
Se implementó un sistema de **Control de Acceso Basado en Roles (RBAC)** de grano fino. La seguridad se articula en tres niveles:
1.  **Autenticación:** Gestión de sesiones mediante JSON Web Tokens (JWT) con hashing Bcrypt.
2.  **Autorización de API:** Decoradores de seguridad en el backend que validan permisos granulares antes de la ejecución de cualquier lógica.
3.  **Protección de Interfaz:** Componentes de orden superior (HOC) en React que restringen el renderizado de rutas según la jerarquía del usuario.

### 2.3. Infraestructura de Calidad y DevOps
El proyecto sigue principios de **Integración Continua (CI)**:
*   **Linter:** Validación de estándares PEP 8 con Flake8.
*   **QA:** Suite de pruebas con Pytest para validar la lógica de negocio y seguridad.
*   **Despliegue:** Pipeline automatizado en Render (Backend) y Vercel (Frontend).

---

## CAPÍTULO 3: CONCLUSIONES
La Plataforma MEH demuestra que la integración de metodologías ágiles (FDD) con herramientas modernas de ingeniería de software permite construir sistemas escalables, seguros y auditables, cumpliendo con los estándares de excelencia técnica exigidos por la Universidad Mayor de San Andrés.
