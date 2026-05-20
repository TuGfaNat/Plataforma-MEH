# Etapa de construcción
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Construir el sitio de documentación
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine as production-stage

# Copiar los archivos construidos al directorio de nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
