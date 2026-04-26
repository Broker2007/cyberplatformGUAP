# --- Stage 1: сборка React ---
FROM node:20-alpine AS build 
WORKDIR /app

# Сначала только зависимости (чтобы кеш лучше работал)
COPY frontend/package*.json ./
RUN npm ci

# Теперь копируем остальной код и собираем
COPY frontend/ .
RUN npm run build:prod

# --- Stage 2: nginx со статикой ---
FROM nginx:alpine

# Удаляем дефолтную страницу nginx и кладём нашу сборку
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html

COPY deployments/frontend/nginx.conf /etc/nginx/conf.d/default.conf
# Если у тебя CRA, а не Vite, то вместо dist будет build:
# COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

