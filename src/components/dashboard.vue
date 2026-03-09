<template>
  <section class="container">
    <div class="dashcontainer">
      <div class="counter orders">
        <div class="icon" style="border:2px solid var(--color-primary);">
          <i class="bi bi-bag-check" style="color: var(--color-primary);"></i>
        </div>
        <div class="content">
          <span>Pedidos Totales</span>
          <div id="number">
            <span>{{ loading ? '...' : totalOrders }}</span>
          </div>
        </div>
      </div>

      <div class="counter pending">
        <div class="icon" style="border:2px solid var(--color-warning);">
          <i class="bi bi-clock-history" style="color: var(--color-warning);"></i>
        </div>
        <div class="content">
          <span>Pendientes</span>
          <div id="number">
            <span>{{ loading ? '...' : pendingCount }}</span>
          </div>
        </div>
      </div>

      <div class="counter completed">
        <div class="icon" style="border:2px solid var(--color-success);">
          <i class="bi bi-check2-circle" style="color: var(--color-success);"></i>
        </div>
        <div class="content">
          <span>Completados</span>
          <div id="number">
            <span>{{ loading ? '...' : completedCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()

const loading = computed(() => ordersStore.loading)
const totalOrders = computed(() => ordersStore.pagination.total || 0)

// Note: These counts are only from the loaded page unless we add a stats endpoint.
// For now, it gives a rough idea based on loaded data, which is better than hardcoded.
// Ideally, we'd add an endpoint /api/orders/stats
const pendingCount = computed(() => ordersStore.orders.filter(o => o.status === 'PENDING').length)
const completedCount = computed(() => ordersStore.orders.filter(o => o.status === 'COMPLETED').length)

onMounted(() => {
  if (ordersStore.orders.length === 0) {
    ordersStore.fetchOrders()
  }
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.dashcontainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 1rem;
  width: 100%;
}

.counter {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: left;
  column-gap: 1rem;
  padding: 1.5rem;
  flex: 1 1 220px;
  max-width: 300px;
  color: var(--color-secundary);
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.counter:hover {
  transform: translateY(-5px);
}

.icon {
  display: flex;
  place-items: center;
  border-radius: 12px;
  background-color: #f8f9fa;
  padding: 1rem;
  flex-shrink: 0;
}

.icon i {
  font-size: 1.5rem;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: var(--font-text);
}

.content span:first-child {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
}

#number span {
  font-size: 1.5rem;
  font-weight: 800;
  color: #212529;
}

/* Tablet: 3 KPIs en una fila, reducir tamaño */
@media (max-width: 1023px) {
  .counter {
    flex: 1 1 0;
    max-width: none;
    min-width: 0;
    padding: 1rem;
    column-gap: 0.6rem;
  }

  .icon {
    padding: 0.65rem;
  }

  .icon i {
    font-size: 1.2rem;
  }

  .content span:first-child {
    font-size: 0.78rem;
  }

  #number span {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .dashcontainer { flex-direction: column; }
  .counter { max-width: none; }
}
</style>