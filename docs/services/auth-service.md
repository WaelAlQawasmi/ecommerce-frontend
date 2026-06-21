# Auth Service

Authentication and authorization microservice for the e-commerce platform.

**Repository:** [github.com/WaelAlQawasmi/ecommerce-auth-service](https://github.com/WaelAlQawasmi/ecommerce-auth-service)

## Overview

The Auth Service manages user identity, OAuth2 authentication (Laravel Passport), role-based access control, and publishes domain events to Kafka for event-driven integration with other services.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | PHP 8.3+ |
| Framework | Laravel |
| Authentication | Laravel Passport (OAuth2, JWT) |
| Database | MySQL 8 |
| Cache | Redis 7 |
| Messaging | Kafka |
| Queues | Redis |
| Containerization | Docker + Nginx |
| API Documentation | OpenAPI (Scramble) |
| Testing | PHPUnit (TDD) |

## Features

- User registration (default **customer** role)
- Login / logout with JWT access and refresh tokens
- OAuth2 via Laravel Passport (RS256)
- Role-based access control: **admin**, **support**, **customer**
- Paginated user listing and email search (admin & support)
- Cached user count endpoint with automatic invalidation
- Welcome email on registration (queued)
- Soft-delete user accounts
- Kafka event publishing (`UserRegistered`, `UserLoggedIn`, `UserLoggedOut`)
- Dockerized with Nginx, MySQL, Redis, health checks

## Architecture

```
                API Gateway (Nginx)
                      |
                      v
             Auth Service (Laravel)
                      |
           +----------+----------+
           |          |          |
           v          v          v
         MySQL      Redis      Kafka
```

## Roles

| Slug | Name | Description |
|------|------|-------------|
| `admin` | Administrator | Full administrative access |
| `support` | Support | Read access to user management |
| `customer` | Customer | Default role for registered users |

Staff-only endpoints (`/users`, `/users/search`, `/users/count`) require **admin** or **support** role.

## API Endpoints

Base path: `/api/v1`

All responses use a standard envelope:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {}
}
```

Protected routes require `Authorization: Bearer {access_token}`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user (customer role) |
| POST | `/auth/login` | Public | Login, returns JWT tokens |
| POST | `/auth/logout` | Required | Invalidate session |
| GET | `/auth/me` | Required | Current user profile with roles |

### User Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users?page=1&per_page=15` | Admin/Support | Paginated user list |
| GET | `/users/search?email=john` | Admin/Support | Search by email (partial match) |
| GET | `/users/count` | Admin/Support | Total active users (cached) |
| DELETE | `/users/{user}` | Required | Soft-delete (self or admin) |
| POST | `/users/{user}/roles` | Admin/Support | Assign role to user |

### Roles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/roles` | Admin | List all roles |

### Register Example

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

New users receive the **customer** role and a queued welcome email.

### Login Example

```bash
POST /api/v1/auth/login

{
  "email": "john@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "roles": []
    },
    "token": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "token_type": "Bearer",
      "expires_in": 1296000
    }
  }
}
```

## Kafka Events

| Topic | Event | Payload |
|-------|-------|---------|
| `user.registered` | UserRegistered | `{ "event": "UserRegistered", "user_id": 1, "email": "john@example.com" }` |
| `user.logged-in` | UserLoggedIn | `{ "event": "UserLoggedIn", "user_id": 1 }` |
| `user.logged-out` | UserLoggedOut | `{ "event": "UserLoggedOut", "user_id": 1 }` |

## Database Schema

### users

| Column | Type |
|--------|------|
| id | bigint |
| name | varchar |
| email | varchar |
| password | varchar |
| created_at | timestamp |

### roles

| Column | Type |
|--------|------|
| id | bigint |
| name | varchar |
| slug | varchar |
| description | text |
| created_at | timestamp |

### role_user

Pivot table linking users to roles.

## Environment Variables

```env
APP_NAME=AuthService
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
REDIS_HOST=redis
KAFKA_BROKER=kafka:9092
PASSPORT_PRIVATE_KEY=
PASSPORT_PUBLIC_KEY=
MAIL_MAILER=smtp
QUEUE_CONNECTION=redis
```

## Running Locally

### Docker (Recommended)

```bash
git clone https://github.com/WaelAlQawasmi/ecommerce-auth-service.git
cd ecommerce-auth-service

# Linux / macOS
bash run-production.sh

# Windows
run-production.bat
```

Access at http://localhost

### Makefile

```bash
make help       # All commands
make up         # Start containers
make down       # Stop containers
make migrate    # Run migrations
make seed       # Seed database
make logs-app   # View logs
```

### Manual

```bash
composer install && npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run build
php artisan serve
```

## Testing (TDD)

```bash
php artisan test

# Docker
docker-compose exec app php artisan test
```

Tests cover role definitions, user repository queries, authorization policies (admin/support vs customer), and registration role assignment.

## Docker Stack

The Docker setup includes:

- PHP 8.3 FPM
- MySQL 8.0 with persistent volumes
- Nginx with SSL support
- Redis 7 for caching and queues
- Health checks and automatic migrations

See repo files `QUICKSTART.md` and `DOCKER.md` for detailed Docker documentation.

## Security

- OAuth2 / JWT (RS256) via Laravel Passport
- Password hashing (bcrypt)
- Token expiration and refresh
- Role-based access control
- API rate limiting
- Soft deletes (data retention)

## API Documentation

Swagger / OpenAPI is **disabled in production**. Use local/dev environments only:

- **Local (Auth):** http://localhost/docs/api
- **Production:** not available

## Integration with Products Service

Products Service verifies JWTs using the Auth Service **RSA public key**:

```env
PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

Export this value from the Auth Service `.env` after generating Passport keys.
