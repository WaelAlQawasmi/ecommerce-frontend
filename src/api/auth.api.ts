import { authClient } from '@/api/client'
import type {
  ApiResponse,
  AuthPayload,
  LoginCredentials,
  RegisterCredentials,
  User,
  Role,
  AssignRolePayload,
} from '@/types'

export const authApi = {
  login(credentials: LoginCredentials) {
    return authClient.post<ApiResponse<AuthPayload>>('/auth/login', credentials)
  },

  register(credentials: RegisterCredentials) {
    return authClient.post<ApiResponse<AuthPayload>>('/auth/register', credentials)
  },

  logout() {
    return authClient.post<ApiResponse<null>>('/auth/logout')
  },

  me() {
    return authClient.get<ApiResponse<User>>('/auth/me')
  },

  listRoles() {
    return authClient.get<ApiResponse<Role[]>>('/roles')
  },

  listUsers(page = 1, perPage = 15) {
    return authClient.get<ApiResponse<User[]>>('/users', { params: { page, per_page: perPage } })
  },

  searchUsers(email: string) {
    return authClient.get<ApiResponse<User[]>>('/users/search', { params: { email } })
  },

  getUserCount() {
    return authClient.get<ApiResponse<{ count: number }>>('/users/count')
  },

  assignRole(userId: number, payload: AssignRolePayload) {
    return authClient.post<ApiResponse<User>>(`/users/${userId}/roles`, payload)
  },

  deleteUser(userId: number) {
    return authClient.delete<ApiResponse<null>>(`/users/${userId}`)
  },
}
