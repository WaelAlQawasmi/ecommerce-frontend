import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { hasAnyRole, ROLES } from '@/utils/roles'
import type { RoleSlug } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      redirect: () => {
        const auth = useAuthStore()
        return auth.isAuthenticated ? auth.dashboardPath : '/login'
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/shop',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'shop',
          component: () => import('@/views/shop/ShopView.vue'),
        },
        {
          path: 'products/:id',
          name: 'product-detail',
          component: () => import('@/views/shop/ProductDetailView.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] as RoleSlug[] },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/admin/ProductsView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/views/admin/CategoriesView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UsersView.vue'),
        },
      ],
    },
    {
      path: '/support',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, roles: [ROLES.SUPPORT, ROLES.ADMIN] as RoleSlug[] },
      children: [
        {
          path: '',
          name: 'support-dashboard',
          component: () => import('@/views/support/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'support-users',
          component: () => import('@/views/support/UsersView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.initialize()
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return auth.dashboardPath
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const requiredRoles = to.meta.roles as RoleSlug[] | undefined
  if (requiredRoles && !hasAnyRole(auth.roleSlugs, requiredRoles)) {
    return auth.dashboardPath
  }

  return true
})

export default router
