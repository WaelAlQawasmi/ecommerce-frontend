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
| [AWS Deployment](./docs/deployment-aws.md) | VPC, ALB, EC2, RDS, ECR, S3, CloudFront, WAF, Shield, SSM, CI/CD |
| [Auth Service](./docs/services/auth-service.md) | Authentication, RBAC, Kafka events |
| [Products Service](./docs/services/products-service.md) | Catalog, search, gRPC stock, Kafka |
| [Frontend](./docs/services/frontend.md) | SPA, roles, build and deploy |

## Architecture at a Glance

```
              AWS Shield + WAF
                      |
         CloudFront + S3 (Frontend SPA)
                      |
               Web Browser
                      |
         ALB (HTTPS, public subnets)
                      |
    ┌─────────────────┴─────────────────┐
    │            VPC                     │
    │  Private Subnet (AZ-a)  Private Subnet (AZ-b)
    │       EC2 (Auth)            EC2 (Products)
    │    Docker + Nginx         Docker + Nginx
    │         │                       │
    │    RDS MySQL              RDS PostgreSQL
    │    Redis, Kafka           Redis, Elasticsearch, Kafka
    └───────────────────────────────────┘

    ECR (images) ← VPC Endpoint
    SSM Parameter Store (config) + IAM roles (EC2, CI/CD)
    GitHub Actions → build, push ECR, deploy S3/EC2
```

## User Roles

| Role | Capabilities |
|------|--------------|
| **Customer** | Browse shop, search products, view details |
| **Support** | Search and view users |
| **Admin** | Full CRUD on products/categories, user management, role assignment |

## Production Endpoints

Traffic enters through **AWS Shield**, **WAF**, and **CloudFront** (frontend) or an **Application Load Balancer** (API). EC2 instances run in **private subnets** — no direct public access. **RDS** hosts per-service databases; containers are pulled from **ECR** via a **VPC endpoint**.

| Resource | URL / Target |
|----------|--------------|
| Frontend | CloudFront distribution → S3 (`https://<cloudfront-domain>`) |
| API Gateway (ALB) | `https://<alb-dns-name>/api/v1` |
| Auth routes | `/api/v1/auth/*`, `/users/*`, `/roles/*` → Auth EC2 (`:8080`) |
| Products routes | `/api/v1/products/*`, `/categories/*` → Products EC2 (`:3001`) |

> **API docs (Swagger / OpenAPI) are disabled in production** for both Auth and Products services. Use local/dev environments for interactive API documentation.

Frontend production env uses the **ALB base URL** for both services:

```env
VITE_AUTH_API_URL=https://<alb-dns-name>/api/v1
VITE_PRODUCTS_API_URL=https://<alb-dns-name>/api/v1
```

See [AWS Deployment](./docs/deployment-aws.md) for VPC, ALB, RDS, ECR, WAF, SSM, and GitHub Actions setup.

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
- VPC with private subnets — EC2 and RDS not publicly reachable
- ALB + AWS WAF + Shield for edge protection
- Security groups, IAM roles (EC2 + CI/CD), SSM Parameter Store for secrets/config
- CloudWatch monitoring; Swagger / OpenAPI disabled in production

## License

This project is part of a microservices-based e-commerce platform created for learning, portfolio development, and distributed systems practice.
