# Stage 1: Build the application
FROM node:alpine AS builder

WORKDIR /app

COPY package.json ./

RUN npm install

COPY src/ ./src/
COPY public/ ./public/
COPY angular.json tsconfig*.json ./

RUN npm run build

# Stage 2: Run the application
FROM nginxinc/nginx-unprivileged:alpine-perl

COPY --from=builder /app/dist/cookbook-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
