# Products Service

Production-ready products microservice with catalog management, Elasticsearch search, gRPC stock reservation, and Kafka event consumption.

**Repository:** [github.com/WaelAlQawasmi/ecommerce-prodacts-service](https://github.com/WaelAlQawasmi/ecommerce-prodacts-service)

## Overview

The Products Service handles the product catalog, category management, full-text search, and stock reservation/release. It follows **Domain-Driven Design (DDD)** with a layered architecture and is built using **Test-Driven Development (TDD)**.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20+ / TypeScript |
| REST API | Express + Swagger UI |
| Stock API | gRPC |
| Database | PostgreSQL (Prisma ORM) |
| Search | Elasticsearch 8 |
| Cache / TTL | Redis (reservation expiry) |
| Events | Kafka (stock release consumer) |
| Auth | RS256 JWT from Auth Service |
| Tests | Jest + Supertest (TDD) |
| Containerization | Docker |

## Architecture (DDD Layers)

```
src/
├── domain/           # Entities, value objects, repository interfaces
├── application/      # Use cases (business logic)
├── infrastructure/   # PostgreSQL, Redis, ES, Kafka, gRPC, JWT
├── interfaces/       # HTTP REST + Swagger
└── main.ts           # Bootstrap & dependency wiring
```

```
                API Gateway / Client
                      |
           +----------+----------+
           |                     |
           v                     v
      REST (Express)         gRPC (Stock)
           |                     |
           v                     v
      Products Service
           |
    +------+------+------+------+
    |      |      |      |      |
    v      v      v      v      v
 Postgres Redis   ES   Kafka  JWT Verify
```

## Features

- Product and category CRUD (admin only for writes)
- Paginated product listing and category browsing
- Full-text product search via Elasticsearch
- gRPC stock reservation with TTL (default 15 minutes)
- Kafka consumer for stock release on order cancellation
- JWT RS256 verification (Auth Service public key)
- Rate limiting, Helmet security headers
- Swagger UI (disabled in production by default)

## API Endpoints

Base path: `/api/v1`

All REST endpoints require `Authorization: Bearer <JWT>`.

### Public (Any Authenticated User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products?page=1&limit=20` | List products |
| GET | `/products/search?q=` | Search by name (Elasticsearch) |
| GET | `/products/category/:categoryId` | Products by category |
| GET | `/products/:id` | Get product by ID |
| GET | `/categories` | List categories |
| GET | `/categories/:id` | Get category by ID |

### Admin Only (`role: ["admin"]`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

## gRPC Stock Service

Proto file: `src/infrastructure/grpc/proto/stock.proto`

| RPC | Description |
|-----|-------------|
| `ReserveStock` | Reserve stock with TTL (default 15 min) |
| `GetStockAvailability` | Check total / reserved / available stock |

**Port:** `50051`

### ReserveStock Example

```json
{
  "product_id": "uuid",
  "order_id": "order-123",
  "quantity": 2,
  "ttl_seconds": 900
}
```

## Kafka Events

**Topic:** `stock.release` (configurable via `KAFKA_STOCK_RELEASE_TOPIC`)

Release reserved stock when an order is cancelled:

```json
{ "orderId": "order-123" }
```

Or by reservation ID:

```json
{ "orderId": "order-123", "reservationId": "uuid" }
```

## JWT Verification

Configure the Auth Service RSA public key:

```env
PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

Verification steps:

1. Algorithm must be **RS256** (HS256 rejected)
2. Signature verified with public key
3. `exp` > now, `nbf` <= now
4. Extract `id`, `email`, `role[]` for authorization

## Database Schema

| Table | Description |
|-------|-------------|
| `categories` | Product categories |
| `products` | Catalog items with stock quantity |
| `reviews` | User product reviews (1–5 rating) |
| `stock_reservations` | Reserved stock with TTL and status (`ACTIVE`, `RELEASED`, `CONFIRMED`) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` in prod |
| `PASSPORT_PUBLIC_KEY` | Auth Service RSA public key |
| `KAFKA_STOCK_RELEASE_TOPIC` | Stock release topic name |
| `SWAGGER_ENABLED` | Enable Swagger UI (default: false in production) |

**Production example:**

```env
NODE_ENV=production
SWAGGER_ENABLED=false
PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

See `.env.example` in the repository for the full list.

## Running Locally

### One-Command Docker Setup

```bash
git clone https://github.com/WaelAlQawasmi/ecommerce-prodacts-service.git
cd ecommerce-prodacts-service

# Set PASSPORT_PUBLIC_KEY in .env first
make docker-up
```

**Local URLs:**

| Service | URL |
|---------|-----|
| HTTP API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |
| gRPC | localhost:50051 |

### Makefile Commands

**Application:**

| Command | Description |
|---------|-------------|
| `make setup` | First-time setup |
| `make dev` | Watch mode |
| `make build` | Compile TypeScript |
| `make start` | Run compiled app |
| `make test` | Run tests |
| `make test-coverage` | Coverage report |
| `make lint` | ESLint |

**Infrastructure & Docker:**

| Command | Description |
|---------|-------------|
| `make infra-up` | Start Postgres, Redis, ES, Kafka |
| `make infra-down` | Stop infrastructure |
| `make docker-up` | Full stack (infra + migrate + seed + app) |
| `make docker-down` | Stop full stack |
| `make docker-build` | Build image |
| `make docker-logs` | Tail logs |
| `make docker-restart` | Rebuild and restart |

### Local Development

```bash
make setup
make dev
```

## Testing (TDD)

```bash
make test
make test-watch
make test-coverage
```

Test structure:

- `tests/unit/` — domain entities, use cases, JWT verification
- `tests/integration/` — HTTP API with Supertest

## Security

- Helmet security headers
- Rate limiting (100 req/min default)
- JWT RS256 verification only
- Admin role enforcement on write operations
- Input validation via use cases
- Non-root Docker container
- Swagger disabled in production

## API Documentation

- **Local:** http://localhost:3001/api/docs
- **Production:** http://54.160.228.203:3001/api/docs

## Production Deployment

On EC2, the service runs in Docker and is exposed on port **3001**:

```bash
git clone https://github.com/WaelAlQawasmi/ecommerce-prodacts-service.git
cd ecommerce-prodacts-service
cp .env.example .env
# Configure production values
make docker-up
```

Ensure `PASSPORT_PUBLIC_KEY` matches the Auth Service and `SWAGGER_ENABLED=false`.
