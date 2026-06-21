import { productsClient } from '@/api/client'
import type {
  Product,
  ProductListResponse,
  Category,
  CategoryListResponse,
  CreateProductPayload,
  UpdateProductPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types'

export const productsApi = {
  list(page = 1, limit = 20) {
    return productsClient.get<ProductListResponse>('/products', { params: { page, limit } })
  },

  search(q: string, page = 1, limit = 20) {
    return productsClient.get<ProductListResponse>('/products/search', { params: { q, page, limit } })
  },

  byCategory(categoryId: number, page = 1, limit = 20) {
    return productsClient.get<ProductListResponse>(`/products/category/${categoryId}`, {
      params: { page, limit },
    })
  },

  getById(id: number) {
    return productsClient.get<{ data: Product }>(`/products/${id}`)
  },

  create(payload: CreateProductPayload) {
    return productsClient.post<{ data: Product }>('/products', payload)
  },

  update(id: number, payload: UpdateProductPayload) {
    return productsClient.put<{ data: Product }>(`/products/${id}`, payload)
  },

  remove(id: number) {
    return productsClient.delete(`/products/${id}`)
  },
}

export const categoriesApi = {
  list(page = 1, limit = 50) {
    return productsClient.get<CategoryListResponse>('/categories', { params: { page, limit } })
  },

  getById(id: number) {
    return productsClient.get<{ data: Category }>(`/categories/${id}`)
  },

  create(payload: CreateCategoryPayload) {
    return productsClient.post<{ data: Category }>('/categories', payload)
  },

  update(id: number, payload: UpdateCategoryPayload) {
    return productsClient.put<{ data: Category }>(`/categories/${id}`, payload)
  },

  remove(id: number) {
    return productsClient.delete(`/categories/${id}`)
  },
}
