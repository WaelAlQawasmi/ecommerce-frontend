# E-Commerce Frontend

Vue 3 frontend for a multi-role e-commerce microservices platform.

## Architecture

| Service | Base URL (dev proxy) | Purpose |
|---------|---------------------|---------|
| Auth | `/api/auth` → `http://54.160.228.203/api/v1` | Login, register, users, roles |
| Products | `/api/products` → `http://54.160.228.203:3001/api/v1` | Products, categories, search |

## Roles

- **Customer** — Browse shop, search products, view details
- **Support** — Search and view users
- **Admin** — Full CRUD on products/categories, user management, role assignment

## Stack

- Vue 3 + TypeScript + Vite
- Pinia (state) + Vue Router (lazy routes, role guards)
- Axios (interceptors, Bearer JWT)
- Tailwind CSS 4

## Security

- JWT stored in `sessionStorage` (cleared on tab close)
- Auto-redirect on 401
- Role-based route guards
- Dev proxy avoids CORS issues

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production Build

Copy `.env.example` to `.env.production` and set direct API URLs:

```env
VITE_AUTH_API_URL=http://54.160.228.203/api/v1
VITE_PRODUCTS_API_URL=http://54.160.228.203:3001/api/v1
```

```bash
npm run build
npm run preview
```

## API Documentation

- [Auth Service](http://54.160.228.203/docs/api)
- [Products Service](http://54.160.228.203:3001/api/docs/#/)
