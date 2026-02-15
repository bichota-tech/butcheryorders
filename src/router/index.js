import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Home from '@/views/Home.vue'
import Pedidos from '@/views/Pedidos.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: Pedidos,
    meta: { requiresAuth: true }
  },
  {
    path: '/new-order',
    name: 'NewOrder',
    component: () => import('@/views/NewOrder.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Fetch user profile if authenticated but no user data
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
