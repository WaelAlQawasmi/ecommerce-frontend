# E-Commerce Platform Documentation

Distributed e-commerce platform built as a **microservices architecture** with three independently deployable components: an Auth service, a Products service, and a Vue frontend.

## Repositories

| Component | Repository | Stack |
|-----------|------------|-------|
| Auth Service | [ecommerce-auth-service](https://github.com/WaelAlQawasmi/ecommerce-auth-service) | Laravel, MySQL, Redis, Kafka |
| Products Service | [ecommerce-prodacts-service](https://github.com/WaelAlQawasmi/ecommerce-prodacts-service) | Node.js, TypeScript, PostgreSQL, Elasticsearch, Kafka, gRPC |
| Frontend | [ecommerce-frontend](https://github.com/WaelAlQawasmi/ecommerce-frontend) | Vue 3, TypeScript, Vite, Tailwind CSS |

## Documentation Index

| Document | Description |
|----------|-------------|
| [Diagrams & Schemas](./diagrams.md) | **Visual illustrations** — architecture, structure, ER diagrams, flows |
| [Architecture](./architecture.md) | System design, service boundaries, communication patterns |
| [Development Guide](./development.md) | Local setup for all services (Make, Docker, scripts) |
| [AWS Deployment](./deployment-aws.md) | VPC, ALB, EC2, RDS, ECR, S3, CloudFront, WAF, SSM, CI/CD |
| [Auth Service](./services/auth-service.md) | Authentication, authorization, Kafka events, API reference |
| [Products Service](./services/products-service.md) | Catalog, search, stock reservation, gRPC, Kafka |
| [Frontend](./services/frontend.md) | Vue SPA, roles, build scripts, environment configuration |

## Platform Overview

The platform supports three user roles:

| Role | Capabilities |
|------|--------------|
| **Customer** | Register, login, browse products, search catalog, view product details |
| **Support** | View and search users (read-only user management) |
| **Admin** | Full CRUD on products and categories, user management, role assignment |

### High-Level Flow

1. User registers or logs in through the **Frontend** → **Auth Service**.
2. Auth Service returns an **RS256 JWT** (Laravel Passport).
3. Frontend sends the JWT on every request to Auth and Products APIs.
4. Products Service verifies the JWT signature using the Auth Service public key.
5. Auth Service publishes domain events (`UserRegistered`, `UserLoggedIn`, etc.) to **Kafka**.
6. Products Service uses **gRPC** for stock reservation and **Kafka** for stock release events.
7. Product search is powered by **Elasticsearch**.

## Production Endpoints

Backend APIs are exposed through an **Application Load Balancer** in public subnets. EC2 runs in **private subnets**; databases live on **RDS**. The frontend is served from **S3 via CloudFront** with **WAF** and **Shield**.

| Resource | URL |
|----------|-----|
| Frontend | `https://<cloudfront-domain>` (S3 + CloudFront + WAF) |
| API Gateway (ALB) | `https://<alb-dns-name>/api/v1` |

> **Swagger / OpenAPI is disabled in production** on both services. Interactive API docs are available in local/dev only.

## Quick Start (Full Stack Locally)

Each service is Dockerized and includes **Makefile** targets plus **bash production scripts**.

```bash
# 1. Auth Service
git clone https://github.com/WaelAlQawasmi/ecommerce-auth-service.git
cd ecommerce-auth-service
make up          # or: bash run-production.sh

# 2. Products Service
git clone https://github.com/WaelAlQawasmi/ecommerce-prodacts-service.git
cd ecommerce-prodacts-service
make docker-up   # requires PASSPORT_PUBLIC_KEY from Auth Service

# 3. Frontend
git clone https://github.com/WaelAlQawasmi/ecommerce-frontend.git
cd ecommerce-frontend
npm install
npm run dev
```

See [Development Guide](./development.md) for detailed setup and [AWS Deployment](./deployment-aws.md) for production.

## Design Principles

- **Microservices** — Independent deployable services with clear bounded contexts
- **Event-driven** — Kafka for async domain events between services
- **TDD** — Test-driven development on Auth (PHPUnit) and Products (Jest)
- **DDD** — Domain-Driven Design in the Products service
- **Docker-first** — Each service ships with Docker Compose, Nginx, and health checks
- **API Gateway** — ALB + Nginx path-based routing to backend services
- **CI/CD** — GitHub Actions with IAM OIDC, ECR, and S3 deploy

## License

This project is part of a microservices-based e-commerce platform created for learning, portfolio development, and distributed systems practice.
