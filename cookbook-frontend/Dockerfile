# Stage 1: Build
FROM node:alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src/ ./src/
COPY public/ ./public/
COPY angular.json ./
COPY tsconfig*.json ./
COPY src/environment.prod.ts ./src/environment.prod.ts

RUN npm run build:prod

# Stage 2: Serve
FROM node:alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

RUN npm install -g serve

USER appuser

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
