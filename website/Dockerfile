# Etapa de construcción
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Construir el sitio de documentación con BASE_URL configurable (default /docs/)
ARG BASE_URL=/docs/
ENV BASE_URL=$BASE_URL
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine as production-stage

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos a /usr/share/nginx/html/docs y /usr/share/nginx/html
COPY --from=build-stage /app/build /usr/share/nginx/html/docs
RUN cp -r /usr/share/nginx/html/docs/* /usr/share/nginx/html/ || true

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
