<template>
  <header class="header">
    <div class="navbar">
      <div class="logo">
        <!-- <img src="../assets/img/logo.png" alt="Logo carnicería"> -->
        <div class="descr ps-3">
          <h1>Carnicería</h1>
          <span>Gestión de Pedidos</span>
        </div>
      </div>
      <nav class="menu" v-if="authStore.isAuthenticated">
        <ul>
          <li>
            <RouterLink to="/" active-class="active">Panel</RouterLink>
          </li>
          <li>
            <RouterLink to="/pedidos" active-class="active">Pedidos</RouterLink>
          </li>
          <li>
            <RouterLink to="/new-order" active-class="active">Nuevo Pedido</RouterLink>
          </li>
        </ul>
      </nav>
      <div class="user-actions pe-3" v-if="authStore.isAuthenticated">
        <span class="me-3 fw-bold">{{ authStore.user?.name || 'Usuario' }}</span>
        <button @click="handleLogout" class="btn btn-outline-danger btn-sm">
          <i class="bi bi-box-arrow-right"></i> Salir
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>

<style scoped>
/* Contenedor principal como flex vertical */
.header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.navbar {
  width: 100%;
  max-width: 1200px;
  height: auto;
  padding: 0.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.menu ul {
  width: auto;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 1rem;
  padding: 0;
  margin: 0;
}

li {
  list-style: none;
}

a {
  text-decoration: none;
  color: #333;
  font-family: var(--font-titles, sans-serif);
  font-weight: 600;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

a:hover, a.active {
  background-color: var(--color-primary, #0d6efd);
  color: white;
}

.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: .7rem;
  height: auto;
}

.descr {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-family: var(--font-titles, sans-serif);
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
  color: #333;
}

span {
  font-family: var(--font-text, sans-serif);
  font-size: 0.9rem;
  color: #666;
}

.user-actions {
  display: flex;
  align-items: center;
}
</style>
