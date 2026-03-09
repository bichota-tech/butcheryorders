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

      <div class="card-body p-3">
        <div class="detail-grid">
          <!-- COLUMNA 1: Datos del cliente + Productos -->
          <div class="detail-col detail-col-left">
            <!-- Client Info -->
            <div class="mb-3 p-3 bg-light rounded" v-if="ordersStore.currentOrder.clientName || ordersStore.currentOrder.clientPhone || ordersStore.currentOrder.pickupDate">
              <h6 class="fw-bold mb-3 border-bottom pb-2"><i class="bi bi-person-fill me-1"></i> Datos del Cliente</h6>
              <div class="d-flex flex-column gap-2 client-data-list px-2">
                <div v-if="ordersStore.currentOrder.clientName">
                  <span class="text-muted"><i class="bi bi-person me-1"></i>Nombre:</span> <strong class="ms-1">{{ ordersStore.currentOrder.clientName }}</strong>
                </div>
                <div v-if="ordersStore.currentOrder.clientPhone">
                  <span class="text-muted"><i class="bi bi-telephone me-1"></i>Teléfono:</span> <strong class="ms-1">{{ ordersStore.currentOrder.clientPhone }}</strong>
                </div>
                <div v-if="ordersStore.currentOrder.pickupDate">
                  <span class="text-muted"><i class="bi bi-calendar-check me-1"></i>Fecha de Recogida:</span> <strong class="ms-1">{{ formatPickupDate(ordersStore.currentOrder.pickupDate) }}</strong>
                </div>
              </div>
            </div>

            <h5 class="mb-2">Productos</h5>
            <div class="table-responsive">
              <table class="table table-hover align-middle table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-center">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in ordersStore.currentOrder.items" :key="item.id">
                    <td>
                      {{ item.product?.name || 'Producto desconocido' }}
                      <div v-if="item.notes" class="text-muted small fst-italic">
                        <i class="bi bi-info-circle me-1"></i>{{ item.notes }}
                      </div>
                    </td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-center">{{ item.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- COLUMNA 2: Transcripción + Botones -->
          <div class="detail-col detail-col-right">
            <div v-if="ordersStore.currentOrder.transcript" class="mb-3 p-3 bg-light rounded">
              <label class="fw-bold small text-muted mb-1">Transcripción original:</label>
              <p class="mb-0 fst-italic small">"{{ ordersStore.currentOrder.transcript }}"</p>
            </div>

            <!-- Action Buttons -->
            <div class="actions-area">
              <button
                v-if="ordersStore.currentOrder.status === 'PENDING'"
                @click="openModal('complete')"
                class="btn btn-success w-100 mb-2"
                :disabled="loading"
              >
                <i class="bi bi-check2-circle me-1"></i> Completar Pedido
              </button>
              <button
                v-if="ordersStore.currentOrder.status === 'COMPLETED'"
                @click="openModal('archive')"
                class="btn btn-secondary w-100 mb-2"
                :disabled="loading"
              >
                <i class="bi bi-archive me-1"></i> Archivar
              </button>
              <button
                v-if="ordersStore.currentOrder.status === 'PENDING'"
                @click="openModal('cancel')"
                class="btn btn-outline-danger w-100"
                :disabled="loading"
              >
                Cancelar Pedido
              </button>
            </div>
          </div>
        </div>

      </div><!-- end card-body grid -->

      <!-- Confirm Modals -->
      <ConfirmModal
        :isOpen="modal.action === 'complete'"
        title="Completar Pedido"
        message="¿Marcar este pedido como completado?"
        confirmText="Sí, completar"
        type="success"
        @confirm="executeAction"
        @cancel="closeModal"
      />
      <ConfirmModal
        :isOpen="modal.action === 'archive'"
        title="Archivar Pedido"
        message="El pedido se ocultará de la lista principal pero podrás verlo filtrando por 'Archivados'."
        confirmText="Archivar"
        type="warning"
        @confirm="executeAction"
        @cancel="closeModal"
      />
      <ConfirmModal
        :isOpen="modal.action === 'cancel'"
        title="Cancelar Pedido"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        type="danger"
        @confirm="executeAction"
        @cancel="closeModal"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import * as ordersService from '@/services/ordersService'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'

const ordersStore = useOrdersStore()
const loading = ref(false)
const modal = ref({ action: null })

function openModal(action) { modal.value.action = action }
function closeModal()      { modal.value.action = null }

async function executeAction() {
  const action = modal.value.action
  closeModal()

  if (action === 'complete') await completeOrder()
  else if (action === 'archive') await archiveOrder()
  else if (action === 'cancel')  await cancelOrder()
}

async function completeOrder() {
  loading.value = true
  try {
    await ordersStore.updateOrder(ordersStore.currentOrder.id, 'COMPLETED')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function archiveOrder() {
  loading.value = true
  try {
    await ordersService.archiveOrder(ordersStore.currentOrder.id)
    ordersStore.orders = ordersStore.orders.filter(o => o.id !== ordersStore.currentOrder.id)
    ordersStore.currentOrder = null
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function cancelOrder() {
  loading.value = true
  try {
    await ordersStore.deleteOrder(ordersStore.currentOrder.id)
  } catch (error) {
    console.error(error)
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
    case 'ARCHIVED': return 'bg-secondary'
    default: return 'bg-secondary'
  }
}

function formatStatus(status) {
  const map = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmado',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
    'ARCHIVED': '📦 Archivado'
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
  align-items: flex-start;
  width: 50%;
  height: 80vh;
  overflow-y: auto;
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

/* ── Detail grid: single column on mobile/desktop, 2 columns on tablet ─ */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.actions-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Desktop: keep side-by-side panel layout but card stays in 1 column */
@media (min-width: 768px) and (max-width: 1023px) {
  .orderdetails {
    width: 100%;
    height: auto;
    min-height: 60vh;
    align-items: stretch;
  }

  .detail-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  .detail-col-left,
  .detail-col-right {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-col-right {
    border-left: 1px solid #f0f0f0;
    padding-left: 1.25rem;
  }
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .card-header .d-flex {
    flex-direction: column;
    align-items: center !important;
    text-align: center;
    gap: 0.5rem;
  }
  
  .card-header .text-muted {
    text-align: center;
    width: 100%;
  }
  
  .client-data-list {
    font-size: 0.95rem;
  }
  
  .detail-col-left h5 {
    text-align: center;
    margin-top: 1rem;
  }
  
  .orderdetails {
    width: 100%;
    height: auto;
    padding: 0;
  }
}
</style>