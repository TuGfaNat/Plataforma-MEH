# Etapa de construcción
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Argumento para la URL de la API (se puede pasar en el build)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine as production-stage

# Copiar los archivos construidos al directorio de nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx con SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
