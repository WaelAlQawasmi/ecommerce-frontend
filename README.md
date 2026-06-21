# E-Commerce Platform

A **microservices-based e-commerce platform** with three independently deployable components: Auth Service (Laravel), Products Service (Node.js/TypeScript), and a Vue 3 frontend.

## Repositories

| Component | Repository | Stack |
|-----------|------------|-------|
| **Auth Service** | [ecommerce-auth-service](https://github.com/WaelAlQawasmi/ecommerce-auth-service) | Laravel, MySQL, Redis, Kafka, TDD |
| **Products Service** | [ecommerce-prodacts-service](https://github.com/WaelAlQawasmi/ecommerce-prodacts-service) | Node.js, TypeScript, DDD, PostgreSQL, Elasticsearch, gRPC, Kafka, TDD |
| **Frontend** | This repository | Vue 3, TypeScript, Vite, Tailwind CSS |

## Platform Documentation

Full platform documentation lives in the [`docs/`](./docs/README.md) directory:

| Document | Description |
|----------|-------------|
| [Platform Overview](./docs/README.md) | Index and quick start |
| [Diagrams & Schemas](./docs/diagrams.md) | Visual architecture, project structure, ER diagrams, flows |
| [Architecture](./docs/architecture.md) | System design, communication patterns, security |
| [Development Guide](./docs/development.md) | Local setup for all services (Make, Docker, scripts) |
| [AWS Deployment](./docs/deployment-aws.md) | EC2, Nginx gateway, S3, CloudFront, IAM, CloudWatch |
| [Auth Service](./docs/services/auth-service.md) | Authentication, RBAC, Kafka events |
| [Products Service](./docs/services/products-service.md) | Catalog, search, gRPC stock, Kafka |
| [Frontend](./docs/services/frontend.md) | SPA, roles, build and deploy |

## Architecture at a Glance

```
                    CloudFront + S3 (Frontend)
                              |
                         Web Browser
                              |
                    Nginx (API Gateway on EC2)
                     /                    \
            Auth Service              Products Service
            (Laravel)                 (Node.js / DDD)
                |                           |
         MySQL + Redis              PostgreSQL + Redis
                |                     + Elasticsearch
                |                           |
                └──────── Kafka ────────────┘
```

## User Roles

| Role | Capabilities |
|------|--------------|
| **Customer** | Browse shop, search products, view details |
| **Support** | Search and view users |
| **Admin** | Full CRUD on products/categories, user management, role assignment |

## Production Endpoints

All API traffic goes through a single **Nginx API Gateway** on HTTPS (`443`). Path-based routing sends requests to the correct backend — clients never call service ports directly.

| Resource | URL |
|----------|-----|
| API Gateway | `https://54.160.228.203/api/v1` |
| Auth routes | `https://54.160.228.203/api/v1/auth/*`, `/users/*`, `/roles/*` → Auth (`:8080`) |
| Products routes | `https://54.160.228.203/api/v1/products/*`, `/categories/*` → Products (`:3001`) |

> **API docs (Swagger / OpenAPI) are disabled in production** for both Auth and Products services. Use local/dev environments for interactive API documentation.

Frontend production env uses the **same gateway base URL** for both services:

```env
VITE_AUTH_API_URL=https://54.160.228.203/api/v1
VITE_PRODUCTS_API_URL=https://54.160.228.203/api/v1
```

See [API Gateway config](./docs/deployment-aws.md#7-configure-nginx-as-api-gateway) for the full Nginx setup.

## Quick Start

### Backend Services

Each service is Dockerized with **Makefile** and **bash production scripts**:

```bash
# Auth Service
git clone https://github.com/WaelAlQawasmi/ecommerce-auth-service.git
cd ecommerce-auth-service && bash run-production.sh

# Products Service (set PASSPORT_PUBLIC_KEY from Auth first)
git clone https://github.com/WaelAlQawasmi/ecommerce-prodacts-service.git
cd ecommerce-prodacts-service && make docker-up
```

### Frontend (This Repo)

```bash
npm install
npm run dev          # Development at http://localhost:5173
```

**Production build:**

```bash
./scripts/build-production.sh        # Linux/macOS
.\scripts\build-production.ps1       # Windows
```

Deploy `dist/` to S3 + CloudFront. See [AWS Deployment](./docs/deployment-aws.md).

## Frontend Stack

- Vue 3 + TypeScript + Vite
- Pinia (state) + Vue Router (lazy routes, role guards)
- Axios (Bearer JWT interceptors)
- Tailwind CSS 4

## Security

- JWT (RS256) from Auth Service via Laravel Passport
- Role-based route guards and API authorization
- Tokens in `sessionStorage` (cleared on tab close)
- AWS Security Groups, IAM roles, CloudWatch monitoring
- Swagger / OpenAPI disabled in production on all backend services

## License

This project is part of a microservices-based e-commerce platform created for learning, portfolio development, and distributed systems practice.
