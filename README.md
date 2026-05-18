# Microsoft Education Hub (Plataforma MEH)
🚀 **Sistema Integral de Gestión para Comunidades Tecnológicas**

Este proyecto es una plataforma robusta diseñada para la automatización de eventos académicos, control de asistencia vía QR, gestión financiera y emisión automática de certificados con validación criptográfica.

## 🛠️ Stack Tecnológico
- **Backend:** FastAPI (Python 3.11) + SQLAlchemy + PostgreSQL.
- **Frontend:** React + Fluent UI (Microsoft Design System) + Vite.
- **Seguridad:** JWT (JSON Web Tokens) + RBAC (Role Based Access Control) + AuditMixin.

---

## 🚀 Guía de Arranque Rápido

### 1. Requisitos Previos
- Python 3.10+
- Node.js 18+
- PostgreSQL (Instancia activa)

### 2. Configuración del Backend
1. Entrar a la carpeta: `cd backend`
2. Crear entorno virtual: `python -m venv venv`
3. Activar entorno:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instalar dependencias: `pip install -r requirements.txt`
5. Configurar `.env` (Copiar de `.env.example`) e ingresar credenciales de DB.
6. Iniciar servidor: `uvicorn main:app --reload`

### 3. Configuración del Frontend
1. Entrar a la carpeta: `cd frontend`
2. Instalar dependencias: `npm install`
3. Configurar `.env` (Copiar de `.env.example`).
4. Iniciar aplicación: `npm run dev`

---

## 📜 Características Principales
- **Centro de Operaciones QR:** Escaneo en tiempo real para registro de asistencia.
- **Motor de Certificación:** Generación dinámica de PDFs con `jsPDF`.
- **RBAC Dinámico:** 7 niveles de acceso (Desde Visitante hasta SuperAdmin).
- **Auditoría Suprema:** Registro de cada cambio en el sistema para transparencia total.
- **Modo Oscuro Persistente:** Sincronizado vía API con el perfil del usuario.

## 🎓 Créditos Académicos
Desarrollado para la **Universidad Mayor de San Andrés (UMSA)**.  
*Facultad de Ciencias Puras y Naturales - Carrera de Informática.*
