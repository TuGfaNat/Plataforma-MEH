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

---

## 5. Algoritmos Avanzados y Lógica Financiera (Fuzzy Matching & OCR)

Para dar soporte a la validación e integración automática de inscripciones a partir de depósitos financieros, el backend implementa una capa de procesamiento local y de distancia de cadenas.

### A. Algoritmo Jaro-Winkler Puro en Python (`similarity.py`)
El motor de comparación difusa implementa de forma nativa la distancia de Jaro-Winkler para tolerar errores ortográficos en los nombres transcritos por transferencias (ej. "Mamani" vs "Mamany"):
* **Jaro Distance**: Computa la proporción de caracteres coincidentes ($m$) y las transposiciones necesarias ($t$):
  ```
  d_j = (1/3) * (m / |s1| + m / |s2| + (m - t) / m)
  ```
* **Winkler Adjustment**: Incrementa la similitud en función de la longitud del prefijo común $l$ (máximo 4 caracteres) y un factor de escala constante $p = 0.1$:
  ```
  d_w = d_j + l * p * (1 - d_j)
  ```
* **Fuzzy Word Check**: El método `check_name_in_description_fuzzy` normaliza el texto (removiendo acentos y caracteres especiales), tokeniza el nombre completo omitiendo palabras de enlace de 2 letras o menos, y compara cada palabra contra los términos del extracto bancario con un umbral de coincidencia del **85%**.

### B. Conciliación Multivariable y Desambiguación de IDs (`ocrm_service.py`)
La función `procesar_extracto_bancario` busca de forma estructurada los pagos que se encuentran en estado `'PENDIENTE'` cruzándolos contra las filas del archivo CSV de banco:
1. **Coincidencia por ID Exacto**: Para evitar colisiones por substring en identificadores cortos (ej. ID de pago `2` dentro de una descripción con `29`), el motor normaliza y divide la descripción en palabras completas. Si el string `id_pago` existe como palabra exacta, se asigna automáticamente una confianza del **100%**.
2. **Ventanas de Fecha de Pago (±3 días)**: Se calcula la diferencia temporal absoluta entre la fecha del extracto bancario y la registrada por el alumno:
   * Diferencia ≤ 1 día: Se suma un **+15.0%** de confianza.
   * Diferencia ≤ 3 días: Se suma un **+5.0%** de confianza.
3. **Corte de Similitud**: Las tuplas que superan un umbral consolidado de **60.0%** son emparejadas y vinculadas para aprobación rápida del administrador.

### C. Clasificación Determinística de Vouchers (`pagos_service.py`)
Para evitar la aleatoriedad en el procesamiento del comprobante, el endpoint de subida ejecuta una validación determinística basada en el payload físico:
* **Comprobante Digital Válido**: Si el archivo posee un tamaño superior a 5 KB y extensiones `.pdf`, `.png`, `.jpg` o `.jpeg`, el backend asume lectura correcta, registrando un **98% de confianza** y asignando el estado `'VERIFICADO_AUTOMATICO'`.
* **Comprobante Sospechoso/Pequeño**: Si el tamaño es menor, el sistema registra una confianza del **50%** y asocia el estado `'REVISION_MANUAL'` para audición humana del staff.

---

## 6. Variables de Entorno y Configuración de Correo (SMTP)

Para garantizar la seguridad de las credenciales y el aislamiento de claves transaccionales, la Plataforma MEH utiliza variables de entorno inyectadas en tiempo de ejecución. 

### A. Estructura del Archivo `.env` (Desarrollo Local)
El archivo `backend/.env` (ignorado en Git por seguridad) se utiliza para ejecutar el sistema en local sin Docker. Contiene las siguientes claves:

```env
# PERSISTENCIA Y BASE DE DATOS
DATABASE_URL=postgresql://postgres:postgres@localhost/MEH

# SEGURIDAD Y JWT
SECRET_KEY=mlsa_super_secret_key_2026_thesis_project
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CONFIGURACIÓN SMTP (Notificaciones de correo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=meh.bolivia@gmail.com
SMTP_PASSWORD=ejhsvkatcxcrnocf
EMAIL_FROM_NAME=Plataforma MEH

# REDIRECCIONAMIENTO FRONTEND
FRONTEND_URL=https://plataforma-meh.vercel.app
FRONTEND_DASHBOARD=/dashboard
FRONTEND_LEARNING=/learning
FRONTEND_FINANZAS=/finanzas
```

### B. Uso de Gmail App Passwords
Para el envío de correos, la plataforma utiliza el servidor SMTP de Gmail. Debido a las políticas de seguridad de Google, no se debe utilizar la contraseña maestra de la cuenta. En su lugar:
1. Se habilita la **Autenticación en Dos Pasos (2FA)** en la cuenta de Google.
2. Se genera una **Contraseña de Aplicación** (App Password) de 16 caracteres.
3. Se asigna este token de 16 caracteres a la variable `SMTP_PASSWORD`.

### C. Configuración en Docker y Producción
- **Docker Compose:** Las variables se declaran en el archivo `backend/.env.docker` y se inyectan directamente en el contenedor mediante la directiva `env_file` en `docker-compose.yml`.
- **Producción (Render / AWS / VPS):** Por motivos de seguridad y soberanía de datos, el archivo `.env` nunca debe ser subido a Git. En su lugar, estas variables deben configurarse directamente en el panel de administración del proveedor de hosting (ej. sección *Environment Variables* de Render), garantizando que las credenciales permanezcan cifradas e inaccesibles en repositorios públicos.


