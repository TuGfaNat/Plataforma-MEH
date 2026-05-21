---
title: Arquitectura Interna del Backend
sidebar_label: 04. Detalle de Backend FastAPI
---

# Arquitectura Interna del Backend (FastAPI síncrono & SQLAlchemy)

El backend de la Plataforma MEH está desarrollado como un servidor de API RESTful estructurado en **FastAPI** ejecutándose bajo **Python 3.11**. La arquitectura prioriza el rendimiento síncrono puro y la robustez transaccional, evitando el uso excesivo de llamadas asíncronas no bloqueantes que puedan inducir a fallas de concurrencia e hilos a nivel de ORM.

---

## 1. El Servidor Síncrono de FastAPI: Justificación Científica

En el desarrollo web moderno, es común asumir que todas las APIs de FastAPI deben estructurarse utilizando funciones asíncronas (`async def`). Sin embargo, en sistemas empresariales o académicos orientados a transacciones ACID (donde se requiere consistencia inmediata y fuerte, como en la conciliación de pagos y la emisión criptográfica de certificados), la programación asíncrona puede introducir problemas de carrera y latencias en hilos del pool de base de datos.

### Beneficios del Enfoque Síncrono Puro en la Plataforma MEH:
1. **Llamadas Secuenciales y ACID Nativas:** Cada petición HTTP es procesada por un hilo dedicado del servidor web. Las consultas y escrituras en base de datos se ejecutan en orden secuencial, garantizando la validez de los datos y previniendo escrituras fantasmas o lecturas sucias.
2. **Uso de SQLAlchemy Síncrono sobre psycopg2:** SQLAlchemy síncrono opera directamente sobre el driver nativo de PostgreSQL `psycopg2`. Esto asegura transacciones robustas y seguras sin la sobrecarga operativa y los bugs de madurez del ORM asíncrono.
3. **Inyección Limpia de Dependencias de Base de Datos:** La sesión de base de datos se inyecta de forma segura a nivel de cada endpoint de FastAPI utilizando el sistema de dependencias nativo:
   ```python
   from fastapi import Depends
   from sqlalchemy.orm import Session
   from app.database import get_db

   @router.get("/cursos")
   def listar_cursos(db: Session = Depends(get_db)):
       # db opera como una sesión síncrona segura aislada en el hilo actual
       return cursos_service.get_all(db)
   ```

---

## 2. La Capa de Validación y Estructuras (Esquemas Pydantic)

FastAPI utiliza la librería **Pydantic** para gobernar de forma estricta la entrada y salida de datos estructurados hacia los clientes API. Los esquemas residen físicamente en `backend/app/schemas/` y cumplen tres propósitos fundamentales:

1. **Serialización y Deserialización Eficiente:** Valida de forma automática que el JSON enviado por el cliente contenga los campos y tipos requeridos (ej. que el `monto` de un pago sea un valor numérico positivo) antes de iniciar cualquier proceso de base de datos.
2. **Filtrado Seguro de Salida (Data Masking):** Evita que campos sensibles (como el `password_hash`, `reset_token` o metadatos de administración) sean enviados accidentalmente en las respuestas HTTP a los navegadores. Para ello, se definen esquemas específicos de salida (`UserResponse`) que excluyen los atributos sensibles.
3. **Autodocumentación Interactiva (OpenAPI):** Al utilizar tipos fuertemente tipados de Pydantic, FastAPI genera automáticamente la documentación OpenAPI interactiva (Swagger) disponible en `/docs` del backend en caliente.

---

## 3. La Capa de Negocio (Servicios síncronos)

La lógica pura del negocio del Hub está completamente desacoplada de los controladores API. Reside de forma exclusiva en la carpeta de **Servicios** (`backend/app/services/`).

### Flujo de Datos y Responsabilidades de la Capa de Servicio:
1. El enrutador (`router`) de FastAPI intercepta la llamada, valida el Token JWT de seguridad y el esquema Pydantic de entrada, y delega de inmediato el procesamiento al servicio correspondiente.
2. El servicio recibe los parámetros limpios y la sesión inyectada de base de datos (`db: Session`).
3. El servicio ejecuta todas las transacciones secuenciales sobre la base de datos relacional. Si ocurre una regla de negocio fallida (por ejemplo, stock insuficiente de un souvenirs o progreso menor al 100% para emitir un certificado), el servicio aborta la operación y lanza una excepción de dominio controlada.
4. El servicio ejecuta el guardado de la transacción utilizando `db.commit()` y retorna el modelo SQLAlchemy actualizado para que el router lo serialice y lo envíe de vuelta al cliente React en formato JSON.

---

## 4. Persistencia Relacional Unificada en `models.py`

Para mantener la consistencia física, gobernanza de datos y simplificar el historial de migraciones de Alembic, **todas** las entidades relacionales de base de datos de la Plataforma MEH están declaradas dentro del archivo maestro único **`backend/app/models/models.py`**.

Esta decisión arquitectónica elimina la fragmentación física y los problemas de importación circular comunes en SQLAlchemy, asegurando que las dependencias y relaciones complejas (como las relaciones many-to-many de `eventos_speakers` o `eventos_auspiciadores`) se resuelvan e indexen físicamente de forma impecable en el servidor relacional PostgreSQL al compilar la aplicación.
