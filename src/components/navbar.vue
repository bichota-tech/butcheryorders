<template>
  <header class="header">
    <div class="navbar">
      <div class="logo">
        <div class="descr ps-3">
          <h1>Carnicería</h1>
          <span>Gestión de Pedidos</span>
        </div>
      </div>
      
      <!-- Botón Hamburguesa (solo visible en móvil) -->
      <button class="hamburger" @click="toggleMenu" v-if="authStore.isAuthenticated" aria-label="Abrir menú">
        <span class="bar" :class="{ 'open': isMenuOpen }"></span>
        <span class="bar" :class="{ 'open': isMenuOpen }"></span>
        <span class="bar" :class="{ 'open': isMenuOpen }"></span>
      </button>

      <nav class="menu" :class="{ 'is-open': isMenuOpen }" v-if="authStore.isAuthenticated">
        <ul>
          <li>
            <RouterLink to="/" active-class="active" @click="closeMenu">Panel</RouterLink>
          </li>
          <li>
            <RouterLink to="/pedidos" active-class="active" @click="closeMenu">Pedidos</RouterLink>
          </li>
          <li>
            <RouterLink to="/new-order" active-class="active" @click="closeMenu">Nuevo Pedido</RouterLink>
          </li>
          <!-- Botón de salir movido al menú en móvil -->
          <li class="mobile-logout">
            <button @click="handleLogout" class="btn btn-outline-danger btn-sm w-100">
              <i class="bi bi-box-arrow-right"></i> Salir
            </button>
          </li>
        </ul>
      </nav>
      
      <div class="user-actions pe-3" v-if="authStore.isAuthenticated">
        <span class="me-3 fw-bold">{{ authStore.user?.name || 'Usuario' }}</span>
        <button @click="handleLogout" class="btn btn-outline-danger btn-sm desktop-logout">
          <i class="bi bi-box-arrow-right"></i> Salir
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleLogout() {
  closeMenu()
  authStore.logout()
}
</script>

<style scoped>
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger .bar {
  width: 2rem;
  height: 0.25rem;
  background: var(--color-primary, #0d6efd);
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

.bar.open:nth-child(1) {
  transform: rotate(45deg);
}
.bar.open:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}
.bar.open:nth-child(3) {
  transform: rotate(-45deg);
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

.mobile-logout {
  display: none;
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
  z-index: 1001;
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

/* ── Responsive ──── */
@media (max-width: 1023px) {
  .header {
    padding: 0.5rem;
  }
  .navbar {
    padding: 0.4rem 0.75rem;
    border-radius: 12px;
  }
  h1 { font-size: 1.25rem; }
  span { font-size: 0.85rem; }
  .user-actions .me-3 { display: none; }
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
    margin-right: 0.5rem;
  }

  .user-actions {
    display: none; /* Hide top right user actions on mobile */
  }

  .menu {
    position: absolute;
    top: 110%;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 1rem 0;
    flex-direction: column;
    align-items: center;
    transform: translateY(-20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 999;
  }

  .menu.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .menu ul {
    flex-direction: column;
    width: 100%;
    column-gap: 0;
    row-gap: 0.2rem;
  }

  .menu ul li {
    width: 90%;
    text-align: center;
  }

  a {
    display: block;
    width: 100%;
    font-size: 1.15rem; /* Letras ligeramente más grandes */
    padding: 0.75rem 1rem;
  }

  .mobile-logout {
    display: block;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .mobile-logout button {
    font-size: 1.1rem;
    padding: 0.6rem;
  }

  h1 { font-size: 1.35rem; }
  span { font-size: 0.9rem; }
}

@media (max-width: 400px) {
  .descr span {
    display: none;
  }
  h1 { font-size: 1.25rem; }
}
</style>
