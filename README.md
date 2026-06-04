# CookBook - Frontend

The Angular frontend for CookBook, a recipe management application for saving and sharing recipes, planning weekly meal schedules, and getting AI-powered meal planning suggestions.

Built with **Angular 21**, **Angular Material**, and **TypeScript 5.9**. Communicates with the CookBook backend via a REST API secured with JWT cookies.

> **Backend repository:** [https://github.com/CookBook-stage2026/CookBook-Backend](https://github.com/CookBook-stage2026/CookBook-Backend)  
> **Live application:** [https://d64m1ytsn90cc.cloudfront.net](https://d64m1ytsn90cc.cloudfront.net)

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Building](#building)
- [CI/CD Pipeline](#cicd-pipeline)
- [Architecture Overview](#architecture-overview)

---

## Project Structure

```
CookBook-Frontend/
└── cookbook-frontend/
    └── src/
        └── app/
            ├── core/                  
            │   ├── components/        # Shell components
            │   └── services/          # Auth and application wide services
            │
            ├── features/              # Feature pages and components
            │   ├── household/
            │   ├── ingredient/
            │   ├── recipe/
            │   └── user/
            │
            └── shared/                # Reusable across features
                ├── components/        # Shared UI components
                ├── domain/            # TypeScript interfaces and models
                ├── pipes/
                ├── services/          # Shared stateless services
                └── utils/
```

---

## Prerequisites

| Tool                                         | Version                              |
|----------------------------------------------|--------------------------------------|
| [Node.js](https://nodejs.org/)               | LTS (20 or higher recommended)       |
| [npm](https://www.npmjs.com/)                | 11.9.0                               |
| [Angular CLI](https://angular.dev/tools/cli) | 21.x (`npm install -g @angular/cli`) |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/CookBook-stage2026/CookBook-Frontend.git
cd CookBook-Frontend/cookbook-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the backend

The frontend proxies all `/api` requests to the backend and redirects OAuth2 flows through it. Make sure the [CookBook Backend](https://github.com/CookBook-stage2026/CookBook-Backend) is running locally on `http://localhost:8080` before starting the dev server.

### 4. Start the development server

```bash
npm start
```

The application is available at `http://localhost:4200` and will automatically reload on file changes.

---

## Environment Configuration

Two environment files control runtime behaviour:

| Variable          | Development             | Production                             |
|-------------------|-------------------------|----------------------------------------|
| `production`      | `false`                 | `true`                                 |
| `apiUrl`          | `/api`                  | `/api`                                 |
| `authRedirectUrl` | `http://localhost:8080` | `https://d64m1ytsn90cc.cloudfront.net` |

**`src/environments/environment.ts`** (development):

```typescript
export const environment = {
  production: false,
  apiUrl: '/api',
  authRedirectUrl: 'http://localhost:8080'
};
```

**`src/environments/environment.prod.ts`** (production):

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',
  authRedirectUrl: 'https://your-app.cloudfront.net'
};
```

`authRedirectUrl` is used to construct OAuth2 login URLs. In development this points directly to the backend; in production the backend sits behind the same CloudFront distribution as the frontend, so the same origin is used for both.

`apiUrl` is `/api` in both environments because in production Nginx routes `/api/*` requests to the backend container, and in development Angular's dev server proxy handles the same path.

---

## Building

### Development build (with watch)

```bash
npm run watch
```

### Production build

```bash
npm run build:prod
```

Build artifacts are written to the `dist/` directory. The production build enables Angular's ahead-of-time compilation, tree-shaking, and bundle optimisation.

---

## CI/CD Pipeline

Three GitHub Actions jobs run on push and pull requests to `main` and `development`. All jobs run from the `./cookbook-frontend` working directory.

### Build & test

Runs on every push and pull request. Sets up Node.js LTS, installs dependencies, and runs a production build (`npm run build:prod`) to verify the app compiles cleanly.

### Docker → GitHub Container Registry (GHCR)

Runs on push only. Builds a Docker image and pushes it to GHCR.

```
ghcr.io/cookbook-stage2026/cookbook-frontend:<branch>
ghcr.io/cookbook-stage2026/cookbook-frontend:latest   # main branch only
```

### Docker → AWS (Elastic Beanstalk)

Runs on push to `development` only. Builds and pushes the Docker image to Amazon ECR, then deploys the full stack by zipping `deploy-files/`, uploading to S3, creating a new Elastic Beanstalk application version, and updating `CookBook-env`.

### Required GitHub secrets

| Secret                                        | Purpose                                               |
|-----------------------------------------------|-------------------------------------------------------|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS deployment credentials                            |
| `AWS_REGION`                                  | Target AWS region                                     |
| `AWS_FRONTEND_TAG`                            | Full ECR image URI used as the Docker tag             |
| `GITHUB_TOKEN`                                | GHCR authentication (auto-provided by GitHub Actions) |

---

## Architecture Overview

The application is built entirely with **Angular standalone components** — no NgModules. Routing is lazy-loaded per feature.

- **`core/`** — Singleton services and shell components instantiated once at app startup. Includes the authentication service, HTTP interceptors (attaching credentials), and route guards.
- **`features/`** — Self-contained feature areas, each lazy-loaded via the Angular router. Features map directly to the backend's domain: recipes, ingredients, households, and users.
- **`shared/`** — Reusable building blocks imported by multiple features. Domain interfaces in `shared/domain/` mirror the backend's API response shapes. Pipes and utility functions live here too.

In production, the frontend is served as a static site from a Docker container behind Nginx. Nginx routes `/api/*` and OAuth2 paths to the backend container, and all other traffic to the Angular app. See the [backend repository](https://github.com/CookBook-stage2026/CookBook-Backend) for the full Nginx and deployment configuration.
