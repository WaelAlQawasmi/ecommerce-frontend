# Platform Diagrams & Schemas

Visual illustrations of the e-commerce platform architecture, project structure, data models, and request flows.

---

## 1. Platform Overview

High-level view of all components and how they connect.

```mermaid
flowchart LR
    subgraph Users
        U[Browser / Mobile]
    end

    subgraph AWS["AWS Cloud"]
        CF[CloudFront CDN]
        S3[(S3\nFrontend SPA)]

        subgraph EC2["EC2 Instance"]
            NGX[Nginx\nAPI Gateway]

            subgraph Auth["Auth Service"]
                LA[Laravel + Passport]
            end

            subgraph Products["Products Service"]
                NA[Node.js + Express]
                GR[gRPC Stock Server]
            end

            KF{{Kafka}}
        end

        CW[CloudWatch]
        IAM[IAM Role]
        SG[Security Groups]
    end

    U -->|HTTPS static assets| CF --> S3
    U -->|REST + JWT HTTPS :443| NGX
    NGX -->|/api/v1/products|categories| NA
    NGX -->|other /api/v1/*| LA
    LA --> KF
    NA --> KF
    NA -.->|RS256 public key| LA
    EC2 -.-> CW
    EC2 -.-> IAM
    EC2 -.-> SG
```

---

## 2. AWS Production Infrastructure

Detailed deployment topology on AWS (VPC, private subnets, ALB, RDS, ECR, WAF).

```mermaid
flowchart TB
    Internet((Internet))

    subgraph Edge["Edge Layer"]
        Shield[AWS Shield]
        WAF[AWS WAF]
        CF[CloudFront Distribution]
        S3[(S3 Bucket\necommerce-frontend)]
    end

    subgraph VPC["VPC"]
        subgraph PublicSubnet["Public Subnets"]
            ALB[Application Load Balancer\nHTTPS :443]
        end

        subgraph PrivateSubnet["Private Subnets (2 AZs)"]
            EC2Auth[EC2 — Auth Service]
            EC2Prod[EC2 — Products Service]
            NGX[Nginx\npath-based routing]
            REDIS_A[(Redis Auth)]
            REDIS_P[(Redis Products)]
            ES[(Elasticsearch)]
            KAFKA{{Kafka}}
        end

        subgraph RDSLayer["RDS"]
            MYSQL[(RDS MySQL\nAuth DB)]
            PG[(RDS PostgreSQL\nProducts DB)]
        end

        VPCE[VPC Endpoint\nECR]
    end

    subgraph Monitoring["Observability & Config"]
        CW_LOGS[CloudWatch Logs]
        CW_METRICS[CloudWatch Metrics]
        SSM[SSM Parameter Store]
    end

    IAM[IAM Roles\nEC2 + GitHub Actions OIDC]
    GHA[GitHub Actions\nCI/CD]

    Internet --> Shield --> WAF
    WAF --> CF --> S3
    Internet -->|API| ALB --> NGX
    NGX --> EC2Auth
    NGX --> EC2Prod
    EC2Auth --> MYSQL
    EC2Prod --> PG
    EC2Auth --> REDIS_A
    EC2Auth --> KAFKA
    EC2Prod --> REDIS_P
    EC2Prod --> ES
    EC2Prod --> KAFKA
    EC2Auth --> VPCE
    EC2Prod --> VPCE
    EC2Auth --> SSM
    EC2Prod --> SSM
    EC2Auth --> IAM
    EC2Prod --> IAM
    EC2Auth --> CW_LOGS
    EC2Prod --> CW_LOGS
    GHA -->|push images| VPCE
    GHA -->|sync dist/| S3
```

### Security Group Rules

```mermaid
flowchart LR
    subgraph Public["Public-Facing"]
        P1[ALB HTTPS 443\n0.0.0.0/0]
        P2[CloudFront + WAF\nedge protection]
    end

    subgraph Private["Private Only"]
        B0[EC2 from ALB SG only]
        B1[RDS MySQL 3306\nAuth EC2 SG]
        B2[RDS PostgreSQL 5432\nProducts EC2 SG]
        B3[Redis, Kafka, ES\nVPC internal]
        B4[ECR via VPC Endpoint]
    end

    subgraph Admin["Admin Access"]
        A1[SSM Session Manager\nno SSH from internet]
    end
```

---

## 3. Nginx API Gateway Routing

ALB terminates HTTPS and forwards to Nginx on EC2. Nginx routes by path to internal backends.

```mermaid
flowchart TB
    Client[Client / Frontend]

    ALB[ALB\nHTTPS :443]

    subgraph Nginx["Nginx on EC2\n(private subnet)"]
        PROD_LOC["location ~ ^/api/v1/(products|categories)"]
        AUTH_LOC["location /api/v1/"]
    end

    subgraph Upstreams["Internal (localhost only)"]
        AUTH_UP["127.0.0.1:8080\nAuth Service"]
        PROD_UP["127.0.0.1:3001\nProducts Service"]
    end

    Client --> ALB
    ALB -->|GET /api/v1/auth/login| AUTH_LOC
    ALB -->|GET /api/v1/users| AUTH_LOC
    ALB -->|GET /api/v1/products| PROD_LOC
    ALB -->|GET /api/v1/categories| PROD_LOC

    PROD_LOC --> PROD_UP
    AUTH_LOC --> AUTH_UP
```

| Path | Upstream | Port |
|------|----------|------|
| `/api/v1/products/*`, `/api/v1/categories/*` | Products Service | `127.0.0.1:3001` |
| `/api/v1/*` (auth, users, roles, …) | Auth Service | `127.0.0.1:8080` |

> **Production:** `/docs/*` (Auth) and `/api/docs` (Products) are **disabled** — do not route them through the gateway.

**Note:** The products/categories `location` block must be defined **before** the catch-all `/api/v1/` block in Nginx.

---

## 4. Repository Structure (All Services)

Three independent Git repositories that compose the platform.

```mermaid
flowchart TB
    subgraph Platform["E-Commerce Platform"]
        FE[ecommerce-frontend\nVue 3 SPA]
        AUTH[ecommerce-auth-service\nLaravel Microservice]
        PROD[ecommerce-prodacts-service\nNode.js Microservice]
    end

    FE -->|REST + JWT| AUTH
    FE -->|REST + JWT| PROD
    PROD -->|Verify JWT\npublic key| AUTH
    AUTH -->|Kafka events| PROD
```

### 4.1 Auth Service Structure

```
ecommerce-auth-service/
├── app/                    # Laravel application code
│   ├── Http/
│   │   ├── Controllers/  # API controllers
│   │   └── Middleware/     # RBAC, rate limiting
│   ├── Models/             # User, Role
│   ├── Policies/           # Authorization policies
│   ├── Events/             # UserRegistered, UserLoggedIn
│   └── Listeners/          # SendWelcomeEmail, FlushUserCountCache
├── bootstrap/
├── config/                 # App, DB, Redis, Kafka, Passport
├── database/
│   ├── migrations/         # users, roles, role_user
│   └── seeders/
├── docker/                 # Nginx, PHP configs
├── docs/                   # Service documentation
├── routes/
│   └── api.php             # /api/v1 routes
├── tests/                  # PHPUnit (TDD)
├── Dockerfile
├── docker-compose.yml
├── Makefile                # make up, migrate, seed
├── run-production.sh       # One-command prod stack
└── README.md
```

### 4.2 Products Service Structure (DDD)

```
ecommerce-prodacts-service/
├── src/
│   ├── domain/             # Entities, value objects, repo interfaces
│   │   ├── entities/       # Product, Category, StockReservation
│   │   └── repositories/   # Repository interfaces
│   ├── application/        # Use cases (business logic)
│   │   └── use-cases/      # CreateProduct, ReserveStock, SearchProducts
│   ├── infrastructure/     # External adapters
│   │   ├── database/       # Prisma repositories
│   │   ├── elasticsearch/  # Search adapter
│   │   ├── kafka/          # Stock release consumer
│   │   ├── grpc/           # Stock gRPC server + proto
│   │   └── jwt/            # RS256 verification
│   ├── interfaces/         # HTTP REST + Swagger
│   │   └── http/           # Express routes, controllers
│   └── main.ts             # Bootstrap & DI wiring
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── migrations/
├── tests/
│   ├── unit/               # Domain, use cases, JWT
│   └── integration/        # HTTP API (Supertest)
├── scripts/
├── Dockerfile
├── docker-compose.yml
├── Makefile                # make docker-up, test, dev
└── README.md
```

### 4.3 Frontend Structure

```
ecommerce-frontend/
├── public/                 # Static assets
├── scripts/
│   ├── build-production.sh # Linux/macOS prod build
│   └── build-production.ps1# Windows prod build
├── src/
│   ├── api/
│   │   ├── client.ts       # Axios + JWT interceptors
│   │   ├── auth.api.ts     # Auth Service calls
│   │   └── products.api.ts # Products Service calls
│   ├── components/
│   │   ├── common/         # Modal, Pagination, Alert, Spinner
│   │   ├── layout/         # AppHeader
│   │   └── products/       # ProductCard
│   ├── layouts/
│   │   ├── AppLayout.vue   # Shop layout
│   │   └── DashboardLayout.vue  # Admin/Support layout
│   ├── router/
│   │   └── index.ts        # Routes + role guards
│   ├── stores/
│   │   └── auth.store.ts   # Pinia auth state
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   ├── helpers.ts      # Token storage
│   │   └── roles.ts        # Role constants
│   ├── views/
│   │   ├── auth/           # Login, Register
│   │   ├── shop/           # Shop, ProductDetail
│   │   ├── admin/          # Dashboard, Products, Categories, Users
│   │   └── support/        # Dashboard, Users
│   ├── App.vue
│   └── main.ts
├── docs/                   # Platform documentation
├── .env.example
├── .env.production.example
├── vite.config.ts          # Dev proxy config
└── README.md
```

---

## 5. Frontend Route & Role Schema

```mermaid
flowchart TB
    subgraph Guest["Guest Routes"]
        LOGIN["/login"]
        REGISTER["/register"]
    end

    subgraph Customer["Customer — role: customer"]
        SHOP["/shop"]
        DETAIL["/shop/products/:id"]
    end

    subgraph Support["Support — role: support"]
        SDASH["/support"]
        SUSERS["/support/users"]
    end

    subgraph Admin["Admin — role: admin"]
        ADASH["/admin"]
        APROD["/admin/products"]
        ACAT["/admin/categories"]
        AUSERS["/admin/users"]
    end

    LOGIN -->|authenticate| SHOP
    REGISTER -->|authenticate| SHOP
    SHOP --> DETAIL

    SDASH --> SUSERS
    ADASH --> APROD
    ADASH --> ACAT
    ADASH --> AUSERS
```

| Role | Default redirect | Allowed areas |
|------|------------------|---------------|
| `customer` | `/shop` | Shop, product details |
| `support` | `/support` | Support dashboard, user search |
| `admin` | `/admin` | Full admin + inherits support access |

---

## 6. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (Vue SPA)
    participant A as Auth Service
    participant P as Products Service
    participant PP as Laravel Passport

    Note over B,P: Registration / Login
    B->>A: POST /api/v1/auth/login
    A->>A: Validate credentials
    A->>PP: Issue RS256 JWT + refresh token
    PP-->>A: access_token, refresh_token
    A->>A: Publish UserLoggedIn → Kafka
    A-->>B: user + tokens
    B->>B: Store JWT in sessionStorage

    Note over B,P: Authenticated API call
    B->>P: GET /api/v1/products<br/>Authorization: Bearer JWT
    P->>P: Verify RS256 signature<br/>(PASSPORT_PUBLIC_KEY)
    P->>P: Check exp, nbf, extract roles
    P-->>B: Product list JSON

    Note over B,P: Admin CRUD
    B->>P: POST /api/v1/products<br/>Authorization: Bearer JWT
    P->>P: Verify JWT + check role = admin
    P->>P: Create product + index in Elasticsearch
    P-->>B: Created product
```

---

## 7. Event-Driven Architecture (Kafka)

```mermaid
flowchart LR
    subgraph Producers
        AUTH[Auth Service]
        ORDER[Order Service\n(future)]
    end

    subgraph Kafka["Kafka Event Bus"]
        T1[user.registered]
        T2[user.logged-in]
        T3[user.logged-out]
        T4[stock.release]
    end

    subgraph Consumers
        PROD[Products Service]
        NOTIFY[Notification Service\n(future)]
        ANALYTICS[Analytics\n(future)]
    end

    AUTH -->|publish| T1
    AUTH -->|publish| T2
    AUTH -->|publish| T3
    ORDER -->|publish| T4

    T4 -->|consume| PROD
    T1 -.->|future| NOTIFY
    T2 -.->|future| ANALYTICS
```

### Kafka Topic Schemas

**user.registered**
```json
{
  "event": "UserRegistered",
  "user_id": 1,
  "email": "john@example.com"
}
```

**user.logged-in**
```json
{
  "event": "UserLoggedIn",
  "user_id": 1
}
```

**stock.release**
```json
{
  "orderId": "order-123",
  "reservationId": "uuid-optional"
}
```

---

## 8. Stock Reservation Flow (gRPC + Kafka)

```mermaid
sequenceDiagram
    participant O as Order Service
    participant G as Products gRPC :50051
    participant DB as PostgreSQL
    participant R as Redis
    participant K as Kafka

    Note over O,K: Reserve stock at checkout
    O->>G: ReserveStock(product_id, order_id, qty, ttl=900)
    G->>DB: Check available stock
    G->>DB: Create reservation (ACTIVE)
    G->>R: Set TTL expiry key
    G-->>O: reservation_id, expires_at

    Note over O,K: Order cancelled
    O->>K: Publish stock.release { orderId }
    K->>G: Consumer receives event
    G->>DB: Update reservation → RELEASED
    G->>DB: Restore product stock quantity
    G->>R: Clear TTL key
```

---

## 9. Database Schemas

### 9.1 Auth Service (MySQL)

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        timestamp created_at
        timestamp deleted_at
    }

    ROLES {
        bigint id PK
        varchar name
        varchar slug UK
        text description
        timestamp created_at
    }

    ROLE_USER {
        bigint user_id FK
        bigint role_id FK
    }

    USERS ||--o{ ROLE_USER : has
    ROLES ||--o{ ROLE_USER : assigned_to
```

**Role slugs:** `admin`, `support`, `customer`

### 9.2 Products Service (PostgreSQL)

```mermaid
erDiagram
    CATEGORIES {
        uuid id PK
        varchar name
        text description
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        uuid id PK
        varchar name
        text description
        decimal price
        int stock_quantity
        uuid category_id FK
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        uuid id PK
        uuid product_id FK
        int user_id
        int rating
        text comment
        timestamp created_at
    }

    STOCK_RESERVATIONS {
        uuid id PK
        uuid product_id FK
        varchar order_id
        int quantity
        enum status
        timestamp expires_at
        timestamp created_at
    }

    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ REVIEWS : has
    PRODUCTS ||--o{ STOCK_RESERVATIONS : reserves
```

**Reservation status:** `ACTIVE` | `RELEASED` | `CONFIRMED`

---

## 10. Products Service — DDD Layer Schema

How requests flow through Domain-Driven Design layers.

```mermaid
flowchart TB
    subgraph Interfaces["interfaces/ (Delivery)"]
        HTTP[Express REST Routes]
        SWAGGER[Swagger UI]
        GRPC_IN[gRPC Stock Server]
    end

    subgraph Application["application/ (Use Cases)"]
        UC1[CreateProduct]
        UC2[SearchProducts]
        UC3[ReserveStock]
        UC4[ReleaseStock]
    end

    subgraph Domain["domain/ (Core)"]
        ENT[Entities\nProduct, Category, Reservation]
        VO[Value Objects]
        REPO_IF[Repository Interfaces]
    end

    subgraph Infrastructure["infrastructure/ (Adapters)"]
        PRISMA[Prisma → PostgreSQL]
        ES[Elasticsearch Client]
        REDIS[Redis TTL]
        KAFKA_C[Kafka Consumer]
        JWT_V[JWT Verifier]
    end

    HTTP --> UC1
    HTTP --> UC2
    GRPC_IN --> UC3
    KAFKA_C --> UC4

    UC1 --> ENT
    UC2 --> ENT
    UC3 --> ENT
    UC4 --> ENT

    UC1 --> REPO_IF
    UC2 --> REPO_IF
    UC3 --> REPO_IF

    REPO_IF --> PRISMA
    REPO_IF --> ES
    UC3 --> REDIS
    HTTP --> JWT_V
```

---

## 11. Auth Service — Internal Layer Schema

```mermaid
flowchart TB
    subgraph HTTP["HTTP Layer"]
        ROUTES[routes/api.php]
        CTRL[Controllers]
        MW[Middleware\nRBAC, RateLimit]
    end

    subgraph Domain["Application Layer"]
        POL[Policies\nUserPolicy]
        EVT[Events\nUserRegistered]
        LST[Listeners\nSendWelcomeEmail]
    end

    subgraph Infra["Infrastructure"]
        MYSQL[(MySQL)]
        REDIS[(Redis Cache + Queue)]
        KAFKA_P[Kafka Producer]
        MAIL[Mail / Queue Worker]
        PASSPORT[Laravel Passport]
    end

    ROUTES --> MW --> CTRL
    CTRL --> POL
    CTRL --> PASSPORT
    CTRL --> MYSQL
    CTRL --> REDIS
    CTRL --> EVT
    EVT --> LST
    EVT --> KAFKA_P
    LST --> MAIL
    MAIL --> REDIS
```

---

## 12. Frontend Data Flow

```mermaid
flowchart LR
    subgraph Views
        V[Vue Components]
    end

    subgraph State
        PINIA[Pinia auth.store]
        SS[sessionStorage\nJWT token]
    end

    subgraph API
        AC[auth.api.ts]
        PC[products.api.ts]
        AX[Axios client.ts\ninterceptors]
    end

    subgraph Backend
        GW[Nginx API Gateway :443]
        AUTH[Auth Service :8080]
        PROD[Products Service :3001]
    end

    V --> PINIA
    V --> AC
    V --> PC
    PINIA --> SS
    AC --> AX
    PC --> AX
    AX -->|Bearer JWT HTTPS :443| GW[Nginx API Gateway]
    GW --> AUTH
    GW --> PROD
    AX -->|401| V
```

---

## 13. Development vs Production Topology

```mermaid
flowchart TB
    subgraph Dev["Local Development"]
        VITE[Vite Dev Server\n:5173]
        PROXY[Vite Proxy]
        AUTH_D[Auth Docker\nlocalhost]
        PROD_D[Products Docker\nlocalhost:3001]

        VITE --> PROXY
        PROXY -->|/api/auth → /api/v1| AUTH_D
        PROXY -->|/api/products → /api/v1| PROD_D
    end

    subgraph Prod["Production"]
        CF2[CloudFront + WAF]
        S3P[(S3 dist/)]
        ALB2[ALB\nHTTPS :443]
        NGX2[Nginx\npath routing]
        AUTH_P[Auth :8080]
        PROD_P[Products :3001]

        CF2 --> S3P
        Browser2[Browser] -->|https://<alb-dns>/api/v1| ALB2
        Browser2 --> CF2
        ALB2 --> NGX2
        NGX2 -->|products, categories| PROD_P
        NGX2 -->|auth, users, roles| AUTH_P
    end
```

| Environment | Frontend | Auth API URL | Products API URL |
|-------------|----------|--------------|------------------|
| Development | Vite `:5173` | `/api/auth` (proxy) | `/api/products` (proxy) |
| Production | S3 + CloudFront + WAF | `https://<alb-dns-name>/api/v1` | `https://<alb-dns-name>/api/v1` |

---

## 14. Build & Deploy Pipeline (GitHub Actions)

```mermaid
flowchart LR
    subgraph AuthDeploy["Auth Service CI/CD"]
        A1[Push to main]
        A2[PHPUnit tests]
        A3[Docker build]
        A4[Push to ECR]
        A5[SSM deploy on EC2]
        A1 --> A2 --> A3 --> A4 --> A5
    end

    subgraph ProdDeploy["Products Service CI/CD"]
        P1[Push to main]
        P2[Jest tests]
        P3[Docker build]
        P4[Push to ECR]
        P5[SSM deploy on EC2]
        P1 --> P2 --> P3 --> P4 --> P5
    end

    subgraph FrontDeploy["Frontend CI/CD"]
        F1[Push to main]
        F2[npm ci + build]
        F3[dist/ folder]
        F4[aws s3 sync]
        F5[CloudFront invalidation]
        F1 --> F2 --> F3 --> F4 --> F5
    end

    OIDC[IAM OIDC Role\nGitHub Actions]
    OIDC -.-> AuthDeploy
    OIDC -.-> ProdDeploy
    OIDC -.-> FrontDeploy
```

---

## 15. Tech Stack Map

```mermaid
mindmap
  root((E-Commerce Platform))
    Auth Service
      Laravel
      PHP 8.3
      MySQL
      Redis
      Kafka
      Passport JWT
      PHPUnit TDD
      Docker Nginx
    Products Service
      Node.js 20
      TypeScript
      DDD Layers
      PostgreSQL Prisma
      Elasticsearch
      Redis TTL
      Kafka Consumer
      gRPC Stock
      Jest TDD
      Docker
    Frontend
      Vue 3
      Vite
      Pinia
      Vue Router
      Axios
      Tailwind CSS 4
      S3 CloudFront
    AWS Infrastructure
      EC2
      Nginx Gateway
      S3
      CloudFront
      IAM
      Security Groups
      CloudWatch
```

---

## Related Documentation

- [Architecture](./architecture.md) — Detailed architecture narrative
- [AWS Deployment](./deployment-aws.md) — Step-by-step deployment guide
- [Development Guide](./development.md) — Local setup instructions
