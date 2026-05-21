FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2, pg_isready y otras
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requerimientos e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la aplicación
COPY . .

# Copiar entrypoint y dar permisos de ejecución
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Asegurar que el directorio de estáticos existe
RUN mkdir -p static/uploads

# Exponer el puerto que usa FastAPI
EXPOSE 8000

# Entrypoint — ejecuta migraciones, seed opcional, luego arranca uvicorn
# La variable PORT se toma de env_file (backend/.env.docker)
ENTRYPOINT ["/entrypoint.sh"]
