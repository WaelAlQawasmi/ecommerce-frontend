import type { RoleSlug } from '@/types'

export const ROLES = {
  ADMIN: 'admin' as RoleSlug,
  SUPPORT: 'support' as RoleSlug,
  CUSTOMER: 'customer' as RoleSlug,
} as const

export function hasRole(slugs: RoleSlug[], role: RoleSlug): boolean {
  return slugs.includes(role)
}

export function hasAnyRole(slugs: RoleSlug[], roles: RoleSlug[]): boolean {
  return roles.some((role) => slugs.includes(role))
}

export function isAdmin(slugs: RoleSlug[]): boolean {
  return hasRole(slugs, ROLES.ADMIN)
}

export function isSupport(slugs: RoleSlug[]): boolean {
  return hasRole(slugs, ROLES.SUPPORT)
}

export function isStaff(slugs: RoleSlug[]): boolean {
  return hasAnyRole(slugs, [ROLES.ADMIN, ROLES.SUPPORT])
}

export function getPrimaryRole(slugs: RoleSlug[]): RoleSlug {
  if (isAdmin(slugs)) return ROLES.ADMIN
  if (isSupport(slugs)) return ROLES.SUPPORT
  return ROLES.CUSTOMER
}

export function getRoleLabel(slug: RoleSlug): string {
  const labels: Record<RoleSlug, string> = {
    admin: 'Administrator',
    support: 'Support',
    customer: 'Customer',
  }
  return labels[slug]
}

export function getDashboardPath(slugs: RoleSlug[]): string {
  const primary = getPrimaryRole(slugs)
  if (primary === ROLES.ADMIN) return '/admin'
  if (primary === ROLES.SUPPORT) return '/support'
  return '/shop'
}
