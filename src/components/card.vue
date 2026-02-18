<template>
  <section class="orderdetails">
    <div v-if="!ordersStore.currentOrder" class="empty-state">
      <i class="bi bi-cart-x fs-1 text-muted mb-3"></i>
      <p class="text-muted">Selecciona un pedido para ver los detalles</p>
    </div>

    <div v-else class="card shadow-sm border-0 w-100 h-100">
      <div class="card-header bg-white border-bottom p-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h4 class="mb-0">Pedido #{{ ordersStore.currentOrder.id.substring(0, 8) }}</h4>
          <span class="badge" :class="getStatusClass(ordersStore.currentOrder.status)">
            {{ formatStatus(ordersStore.currentOrder.status) }}
          </span>
        </div>
        <div class="text-muted small">
          {{ formatDate(ordersStore.currentOrder.createdAt) }}
        </div>
      </div>

      <div class="card-body p-4 overflow-auto">
        <!-- Client Info -->
        <div class="mb-4 p-3 bg-light rounded" v-if="ordersStore.currentOrder.clientName || ordersStore.currentOrder.clientPhone">
          <h6 class="fw-bold mb-2"><i class="bi bi-person-fill me-1"></i> Datos del Cliente</h6>
          <div class="row g-2">
            <div class="col-6" v-if="ordersStore.currentOrder.clientName">
              <small class="text-muted d-block">Nombre</small>
              <span class="fw-bold">{{ ordersStore.currentOrder.clientName }}</span>
            </div>
            <div class="col-6" v-if="ordersStore.currentOrder.clientPhone">
              <small class="text-muted d-block">Teléfono</small>
              <span class="fw-bold">{{ ordersStore.currentOrder.clientPhone }}</span>
            </div>
            <div class="col-6" v-if="ordersStore.currentOrder.pickupDate">
              <small class="text-muted d-block">Fecha de Recogida</small>
              <span class="fw-bold">{{ formatPickupDate(ordersStore.currentOrder.pickupDate) }}</span>
            </div>
          </div>
        </div>

        <h5 class="mb-3">Productos</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Producto</th>
                <th class="text-center">Cant.</th>
                <th class="text-center">Unidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ordersStore.currentOrder.items" :key="item.id">
                <td>{{ item.product?.name || 'Producto desconocido' }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-center">{{ item.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="ordersStore.currentOrder.transcript" class="mt-4 p-3 bg-light rounded">
          <label class="fw-bold small text-muted mb-1">Transcripción original:</label>
          <p class="mb-0 fst-italic">"{{ ordersStore.currentOrder.transcript }}"</p>
        </div>
      </div>

      <div class="card-footer bg-white border-top p-3 d-flex justify-content-end gap-2">
         <button 
           v-if="ordersStore.currentOrder.status === 'PENDING'"
           @click="completeOrder" 
           class="btn btn-success"
           :disabled="loading"
         >
           <i class="bi bi-check2-circle me-1"></i>
           Completar Pedido
         </button>
         <button 
           v-if="ordersStore.currentOrder.status === 'PENDING'"
           @click="cancelOrder" 
           class="btn btn-outline-danger"
           :disabled="loading"
         >
           Cancelar Pedido
         </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()
const loading = ref(false)

async function completeOrder() {
  if (!confirm('¿Marcar este pedido como completado?')) return
  
  loading.value = true
  try {
    await ordersStore.updateOrder(ordersStore.currentOrder.id, 'COMPLETED')
  } catch (error) {
    console.error(error)
    alert('Error al completar el pedido')
  } finally {
    loading.value = false
  }
}

async function cancelOrder() {
  if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) return
  
  loading.value = true
  try {
    await ordersStore.deleteOrder(ordersStore.currentOrder.id)
  } catch (error) {
    console.error(error)
    alert('Error al cancelar el pedido')
  } finally {
    loading.value = false
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'PENDING': return 'bg-warning text-dark'
    case 'CONFIRMED': return 'bg-primary'
    case 'COMPLETED': return 'bg-success'
    case 'CANCELLED': return 'bg-danger'
    default: return 'bg-secondary'
  }
}

function formatStatus(status) {
  const map = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmado',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado'
  }
  return map[status] || status
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('es-ES')
}

function formatPickupDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
</script>

<style scoped>
.orderdetails {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 80vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}
</style>