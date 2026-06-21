import './assets/main.css'

export interface Role {
  id: number
  name: string
  slug: RoleSlug
  description: string | null
}

export type RoleSlug = 'admin' | 'support' | 'customer'

export interface User {
  id: number
  name: string
  email: string
  roles: Role[]
  created_at: string
  updated_at: string
}

export interface TokenPair {
  access_token: string | null
  refresh_token: string | null
  token_type: string
  expires_in: string | null
}

export interface AuthPayload {
  user: User
  token: TokenPair
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: unknown
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  categoryId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

export interface ProductListResponse {
  data: Product[]
  meta: PaginationMeta
}

export interface CategoryListResponse {
  data: Category[]
  meta: PaginationMeta
}

export interface ValidationErrors {
  message: string
  errors?: Record<string, string[]>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface CreateProductPayload {
  name: string
  description?: string
  price: number
  stock: number
  categoryId: number
  isActive?: boolean
}

export interface UpdateProductPayload {
  name?: string
  description?: string
  price?: number
  stock?: number
  categoryId?: number
  isActive?: boolean
}

export interface CreateCategoryPayload {
  name: string
  description?: string
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
}

export interface AssignRolePayload {
  role: RoleSlug
}
