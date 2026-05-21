<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow p-4" style="max-width: 400px; width: 100%">
      <div class="card-body">
        <h2 class="text-center mb-4 text-primary fw-bold">ButcheryOrders</h2>
        <h4 class="text-center mb-4">Iniciar Sesión</h4>

        <Alert :show="!!authStore.error" type="danger" @close="authStore.clearError">
          {{ authStore.error }}
        </Alert>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="email"
              required
              placeholder="nombre@ejemplo.com"
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              required
              placeholder="••••••••"
            />
          </div>
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
              <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </div>
        </form>

        <div class="mt-3 text-center">
          <p class="mb-0 text-muted small"><i class="bi bi-shield-lock me-1"></i>Acceso restringido</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Alert from '@/components/Common/Alert.vue'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')

async function handleLogin() {
  if (!email.value || !password.value) return

  try {
    await authStore.login(email.value, password.value)
  } catch (err) {
    // El error ya se guarda en authStore.error, pero evitamos un rechazo no manejado
    console.error('Login failed:', err)
  }
}
</script>
