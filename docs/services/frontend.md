# Frontend

Vue 3 single-page application for the e-commerce platform, supporting customer shopping, support user lookup, and admin management.

**Repository:** [github.com/WaelAlQawasmi/ecommerce-frontend](https://github.com/WaelAlQawasmi/ecommerce-frontend)

## Overview

The frontend is a role-aware SPA that communicates with the Auth and Products microservices via REST APIs. It uses JWT Bearer tokens for authentication and enforces role-based route guards.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 + TypeScript |
| Build tool | Vite 6 |
| State management | Pinia |
| Routing | Vue Router (lazy-loaded routes, guards) |
| HTTP client | Axios (interceptors, Bearer JWT) |
| Styling | Tailwind CSS 4 |
| Deployment | S3 + CloudFront (static build) |

## Architecture

```
Browser
   |
   v
Vue 3 SPA (Pinia + Vue Router)
   |
   +-- /api/auth/*  ──▶ Auth Service   (login, users, roles)
   +-- /api/products/* ──▶ Products Service (catalog, CRUD)
```

In development, Vite proxies API paths to backend services. In production, the build embeds direct API URLs via environment variables.

## User Roles & Routes

| Role | Dashboard | Routes |
|------|-----------|--------|
| **Customer** | `/shop` | Browse products, search, product details |
| **Support** | `/support` | User search and listing |
| **Admin** | `/admin` | Products CRUD, categories CRUD, user management, role assignment |

### Route Map

| Path | Component | Access |
|------|-----------|--------|
| `/login` | LoginView | Guest only |
| `/register` | RegisterView | Guest only |
| `/shop` | ShopView | Authenticated |
| `/shop/products/:id` | ProductDetailView | Authenticated |
| `/admin` | Admin Dashboard | Admin |
| `/admin/products` | ProductsView | Admin |
| `/admin/categories` | CategoriesView | Admin |
| `/admin/users` | UsersView | Admin |
| `/support` | Support Dashboard | Support, Admin |
| `/support/users` | UsersView | Support, Admin |

Route guards in `src/router/index.ts` check authentication and roles before navigation.

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios instances + JWT interceptors
│   ├── auth.api.ts        # Auth Service endpoints
│   └── products.api.ts    # Products Service endpoints
├── components/
│   ├── common/            # Modal, pagination, alerts, spinner
│   ├── layout/            # App header
│   └── products/          # Product card
├── layouts/
│   ├── AppLayout.vue      # Shop layout
│   └── DashboardLayout.vue # Admin/support layout
├── stores/
│   └── auth.store.ts      # Pinia auth state
├── utils/
│   ├── helpers.ts         # Token storage helpers
│   └── roles.ts           # Role constants and checks
├── views/
│   ├── auth/              # Login, register
│   ├── shop/              # Product browsing
│   ├── admin/             # Admin CRUD views
│   └── support/           # Support views
├── router/index.ts
├── App.vue
└── main.ts
```

## API Integration

Two Axios clients are configured in `src/api/client.ts`:

| Client | Base URL (dev) | Base URL (prod) |
|--------|----------------|-----------------|
| `authClient` | `/api/auth` | `VITE_AUTH_API_URL` |
| `productsClient` | `/api/products` | `VITE_PRODUCTS_API_URL` |

Both clients attach the JWT from `sessionStorage` and redirect to `/login` on 401 responses.

### Auth API Methods

- `login`, `register`, `logout`, `me`
- `listUsers`, `searchUsers`, `getUserCount`
- `listRoles`, `assignRole`, `deleteUser`

### Products API Methods

- `list`, `search`, `byCategory`, `getById`
- `create`, `update`, `remove` (admin)
- Categories: `list`, `getById`, `create`, `update`, `remove`

## Environment Configuration

### Development (`.env`)

```env
VITE_AUTH_API_URL=/api/auth
VITE_PRODUCTS_API_URL=/api/products
```

Vite dev proxy (`vite.config.ts`):

| Proxy | Target (API Gateway) |
|-------|----------------------|
| `/api/auth` | `https://54.160.228.203/api/v1` |
| `/api/products` | `https://54.160.228.203/api/v1` |

### Production (`.env.production`)

Both clients use the same Nginx API Gateway base URL:

```env
VITE_AUTH_API_URL=https://54.160.228.203/api/v1
VITE_PRODUCTS_API_URL=https://54.160.228.203/api/v1
```

Vite embeds these at build time — rebuild when URLs change.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production Build

### npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Type-check + production build |
| `npm run build:prod` | Build with `--mode production` |
| `npm run preview` | Preview default build |
| `npm run preview:prod` | Preview production build |

### Build Scripts

**Linux / macOS:**

```bash
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

**Windows:**

```powershell
.\scripts\build-production.ps1
```

Both scripts:

1. Create `.env.production` from example if missing
2. Install dependencies
3. Run `npm run build:prod`
4. Output to `dist/`

### Deploy to S3

```bash
aws s3 sync dist/ s3://your-ecommerce-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

See [AWS Deployment Guide](../deployment-aws.md) for full CloudFront setup.

## Security

| Measure | Implementation |
|---------|----------------|
| Token storage | `sessionStorage` (cleared on tab close) |
| Unauthorized access | Auto-redirect to `/login` on 401 |
| Route protection | Vue Router guards by auth state and role |
| CORS | Dev proxy avoids cross-origin issues |
| Code splitting | Vendor chunks separated (vue, axios) |

## API Documentation Links

| Environment | Auth (Scramble) | Products (Swagger) |
|-------------|-----------------|---------------------|
| Local / dev | http://localhost/docs/api | http://localhost:3001/api/docs |
| Production | **Disabled** | **Disabled** |

## Customization

### Change Backend URLs (Development)

Edit `vite.config.ts` proxy targets to point to local Docker instances:

```typescript
proxy: {
  '/api/auth': {
    target: 'http://localhost',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/auth/, '/api/v1'),
  },
  '/api/products': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/products/, '/api/v1'),
  },
},
```

### Change Backend URLs (Production)

Edit `.env.production` and rebuild.
