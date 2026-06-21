# Development Guide

This guide covers local development for all three platform components.

## Prerequisites

| Tool | Version | Used By |
|------|---------|---------|
| Docker & Docker Compose | Latest | Auth, Products |
| Node.js | 20+ | Products, Frontend |
| PHP | 8.3+ | Auth (non-Docker) |
| Composer | 2.x | Auth (non-Docker) |
| GNU Make | Any | Auth, Products (Git Bash/WSL on Windows) |
| npm | 10+ | Frontend |

---

## Auth Service

**Repository:** [ecommerce-auth-service](https://github.com/WaelAlQawasmi/ecommerce-auth-service)

### Docker (Recommended)

```bash
git clone https://github.com/WaelAlQawasmi/ecommerce-auth-service.git
cd ecommerce-auth-service

# Linux / macOS
bash run-production.sh

# Windows
run-production.bat

# Or directly
docker-compose up -d --build
```

**Local URLs:**

| Service | URL |
|---------|-----|
| Application | http://localhost |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

**Default MySQL credentials:**

```
Database : ecommerce_auth
User     : auth_user
Password : authpassword123
Root     : rootpassword123
```

### Makefile Commands

```bash
make help       # List all commands
make up         # Start containers
make down       # Stop containers
make migrate    # Run migrations
make seed       # Seed database
make logs-app   # Tail application logs
```

### Manual Setup (Without Docker)

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run build
php artisan serve
```

### Running Tests

```bash
php artisan test

# Inside Docker
docker-compose exec app php artisan test
```

### Key Environment Variables

```env
APP_NAME=AuthService
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
REDIS_HOST=redis
KAFKA_BROKER=kafka:9092
PASSPORT_PRIVATE_KEY=
PASSPORT_PUBLIC_KEY=
```

See [Auth Service docs](./services/auth-service.md) and the repo's `QUICKSTART.md` / `DOCKER.md` for more detail.

---

## Products Service

**Repository:** [ecommerce-prodacts-service](https://github.com/WaelAlQawasmi/ecommerce-prodacts-service)

### One-Command Docker Setup

```bash
git clone https://github.com/WaelAlQawasmi/ecommerce-prodacts-service.git
cd ecommerce-prodacts-service

# Copy Auth Service public key into .env first
make docker-up
```

Before running, set the Auth Service RSA public key in `.env`:

```env
PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
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
| `make setup` | First-time: .env, install, Prisma generate, infra, migrate, seed |
| `make dev` | Run app in watch mode |
| `make build` | Compile TypeScript |
| `make start` | Run compiled app |
| `make test` | Run Jest tests |
| `make test-coverage` | Coverage report |
| `make lint` | ESLint |

**Infrastructure & Docker:**

| Command | Description |
|---------|-------------|
| `make infra-up` | Start Postgres, Redis, Elasticsearch, Kafka |
| `make infra-down` | Stop infrastructure |
| `make docker-up` | Full stack: infra + migrate + seed + app |
| `make docker-down` | Stop full stack |
| `make docker-build` | Build products-service image |
| `make docker-logs` | Tail service logs |
| `make docker-restart` | Rebuild and restart |

### Local Development (Without Full Docker)

```bash
make setup    # env, install, generate, infra-up, migrate-dev, seed
make dev
```

### Running Tests

```bash
make test
make test-watch
make test-coverage
```

See [Products Service docs](./services/products-service.md) for API and gRPC details.

---

## Frontend

**Repository:** [ecommerce-frontend](https://github.com/WaelAlQawasmi/ecommerce-frontend) (this repo)

### Development Server

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The Vite dev server proxies API calls to avoid CORS:

| Proxy Path | Target |
|------------|--------|
| `/api/auth/*` | `http://54.160.228.203/api/v1/*` |
| `/api/products/*` | `http://54.160.228.203:3001/api/v1/*` |

Configure proxy targets in `vite.config.ts` for local backend instances.

### Environment Variables

**Development** (`.env` or `.env.example`):

```env
VITE_AUTH_API_URL=/api/auth
VITE_PRODUCTS_API_URL=/api/products
```

**Production** (`.env.production`):

```env
VITE_AUTH_API_URL=http://54.160.228.203/api/v1
VITE_PRODUCTS_API_URL=http://54.160.228.203:3001/api/v1
```

### Production Build Scripts

**Linux / macOS:**

```bash
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

**Windows (PowerShell):**

```powershell
.\scripts\build-production.ps1
```

Both scripts:

1. Ensure `.env.production` exists (copy from `.env.production.example` if missing)
2. Install dependencies (`npm ci` or `npm install`)
3. Run `npm run build:prod`
4. Output static files to `dist/`

Preview the production build locally:

```bash
npm run preview:prod
```

See [Frontend docs](./services/frontend.md) for routes, roles, and security details.

---

## Connecting Services Locally

When running all services on the same machine:

1. Start **Auth Service** first (generates Passport keys).
2. Copy `PASSPORT_PUBLIC_KEY` from Auth `.env` into Products `.env`.
3. Start **Products Service** (`make docker-up`).
4. Update **Frontend** `vite.config.ts` proxy targets to `http://localhost` and `http://localhost:3001`.
5. Start **Frontend** (`npm run dev`).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Products returns 401 | Verify `PASSPORT_PUBLIC_KEY` matches Auth Service |
| CORS errors in dev | Use Vite proxy paths (`/api/auth`, `/api/products`), not direct URLs |
| Kafka connection refused | Ensure Kafka container is running (`make infra-up`) |
| Elasticsearch not ready | Wait for health check; Products docker-up waits for Postgres |
| MySQL migration fails | Run `make migrate` or `docker-compose exec app php artisan migrate` |
