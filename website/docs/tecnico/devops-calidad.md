---
sidebar_position: 5
title: 5. Ciclo de Vida, DevOps y Calidad
---

# 5. Ciclo de Vida de Desarrollo, DevOps y Calidad de Software

Para garantizar que la **Plataforma MEH** cumpla con los estándares de excelencia técnica y escalabilidad industrial, se ha implementado una estrategia de desarrollo basada en procesos automatizados y control de calidad riguroso. Este capítulo detalla la metodología, el pipeline de CI/CD y las métricas de fiabilidad del sistema.

---

## 5.1. Ciclo de Vida de Desarrollo (SDLC) y Metodología Ágil

El proyecto adopta una metodología de desarrollo ágil, permitiendo entregas incrementales y una rápida adaptación a los requerimientos de la comunidad.

### 5.1.1. Control de Versiones con Git

Se utiliza **Git** bajo un modelo de trabajo basado en ramas (Git Flow simplificado), lo que asegura la integridad de la rama principal (`main`) y permite la experimentación en ramas de características (`feature/*`). Cada cambio es sometido a una revisión técnica antes de su integración, garantizando la trazabilidad histórica de cada línea de código.

---

## 5.2. Pipeline de CI/CD (Integración y Despliegue Continuo)

La estabilidad del **Microsoft EducationHub** se fundamenta en un flujo de trabajo automatizado mediante **GitHub Actions**. Este pipeline actúa como el "guardián" de la calidad, interceptando errores antes de que lleguen a producción.

```text
 [ CÓDIGO FUENTE ]       [ PIPELINE DE CI/CD ]           [ PRODUCCIÓN ]
        |                         |                           |
 (1) [ PUSH ] ------------------->|                           |
        |                         |                           |
        |                  (2) [ LINTING ]                    |
        |                      (Flake8/ESLint)                |
        |                         |                           |
        |                  (3) [ TESTING ]                    |
        |                      (Pytest/Jest)                  |
        |                         |                           |
        |                  (4) [ BUILD ]                      |
        |                      (Docker/Vite)                  |
        |                         |                           |
 (5)    |<----------------- [ DEPLOY ] ---------------------->|
        |                                                     |
```

### Importancia de los pasos:

- **Linting:** Asegura que el código sea legible y siga los estándares PEP 8 (Python) y Airbnb (JS).
- **Testing:** Valida que las nuevas funcionalidades no rompan la lógica existente (Regresión).
- **Deploy:** Automatiza el envío a la nube, eliminando el error humano en la configuración de servidores.

---

## 5.3. Estrategia de Pruebas y Aseguramiento de Calidad (QA)

### 5.3.1. Unit Testing con Pytest

El backend cuenta con una suite de pruebas unitarias exhaustiva utilizando **Pytest**. Estas pruebas validan de forma aislada la lógica de los servicios, especialmente en el cálculo de transacciones financieras y la generación de tokens QR.

### 5.3.2. Cobertura de Código (Code Coverage)

El sistema mantiene una **cobertura de código del 96%**, lo que indica que casi la totalidad de las rutas lógicas críticas han sido verificadas. Se prioriza el testeo de:

1.  **Middleware de Seguridad:** Validación de permisos RBAC.
2.  **Integridad de Pagos:** Flujos de aprobación y rechazo de comprobantes.
3.  **Generación de UUIDs:** Unicidad en la emisión de certificados.

---

## 5.4. Guía de Despliegue e Infraestructura Cloud

La arquitectura de la Plataforma MEH es intrínsecamente escalable gracias a su naturaleza desacoplada y al uso de servicios gestionados en la nube.

| Componente             | Plataforma de Hosting | Justificación                                                 |
| :--------------------- | :-------------------- | :------------------------------------------------------------ |
| **Frontend (SPA)**     | Vercel                | CDN Global y optimización nativa para React/Vite.             |
| **Backend (API)**      | Railway / Render      | Orquestación automática de contenedores y auto-escalado.      |
| **Persistencia**       | Neon DB               | PostgreSQL Serverless administrado con alta disponibilidad. |
| **Certificados/Email** | SMTP Service / S3     | Infraestructura confiable para entrega de documentos masivos. |

---

## 5.5. Variables de Entorno Críticas (.env)

Para el correcto funcionamiento del ecosistema, se deben configurar las siguientes llaves maestras en el entorno de despliegue:

| Variable        | Descripción                                     | Ámbito    |
| :-------------- | :---------------------------------------------- | :-------- |
| `DATABASE_URL`  | URI de conexión segura a Neon PostgreSQL.        | Backend   |
| `SECRET_KEY`    | Semilla criptográfica para firma de JWT.        | Backend   |
| `MAIL_PASSWORD` | Credencial del servidor SMTP para certificados. | Backend   |
| `VITE_API_URL`  | Endpoint público de la API REST.                | Frontend  |

---

## 5.6. Referencias Bibliográficas (APA 7ma Edición)

- Beck, K., et al. (2001). _Manifesto for Agile Software Development_. http://agilemanifesto.org/
- Fowler, M. (2006). _Continuous Integration_. https://martinfowler.com/articles/continuousIntegration.html
- Humble, J., & Farley, D. (2010). _Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation_. Addison-Wesley.
- Myers, G. J., Sandler, C., & Badgett, T. (2011). _The Art of Software Testing_. John Wiley & Sons.
