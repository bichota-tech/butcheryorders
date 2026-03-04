<template>
  <section class="listcontainer">
    <div class="header-actions">
      <h3>Lista de Pedidos</h3>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success" @click="ordersStore.exportOrders" :disabled="ordersStore.loading">
            <i class="bi bi-file-earmark-excel"></i> Exportar
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters mb-3 p-3 bg-light rounded">
      <div class="row g-2">
        <div class="col-md-3">
          <input type="date" class="form-control form-control-sm" v-model="ordersStore.filters.startDate" placeholder="Desde">
        </div>
        <div class="col-md-3">
          <input type="date" class="form-control form-control-sm" v-model="ordersStore.filters.endDate" placeholder="Hasta">
        </div>
        <div class="col-md-3">
            <select class="form-select form-select-sm" v-model="ordersStore.filters.status">
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="ARCHIVED">Archivados</option>
            </select>
        </div>
        <!-- Multi-product filter -->
        <div class="col-md-3 position-relative" ref="productDropdownRef">
          <button
            type="button"
            class="form-select form-select-sm text-start"
            @click="showProductDropdown = !showProductDropdown"
            :class="{ 'border-primary': selectedProductIds.length > 0 }"
          >
            <span v-if="selectedProductIds.length === 0" class="text-muted">Todos los productos</span>
            <span v-else class="fw-bold text-primary">{{ selectedProductIds.length }} producto{{ selectedProductIds.length !== 1 ? 's' : '' }}</span>
          </button>
          <!-- Dropdown panel -->
          <div v-if="showProductDropdown" class="product-dropdown-panel shadow">
            <div class="product-dropdown-search">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="productSearch"
                placeholder="Buscar producto..."
                @click.stop
              >
            </div>
            <div class="product-dropdown-list">
              <label
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-dropdown-item"
                @click.stop
              >
                <input type="checkbox" :value="product.id" v-model="selectedProductIds" @click.stop>
                <span>{{ product.name }}</span>
              </label>
            </div>
            <div class="product-dropdown-footer" v-if="selectedProductIds.length > 0">
              <button class="btn btn-sm btn-link text-danger p-0" @click.stop="selectedProductIds = []">
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
        <div class="col-12 d-flex justify-content-end gap-2 mt-2">
             <button class="btn btn-sm btn-outline-secondary" @click="clearFilters">Limpiar</button>
             <button class="btn btn-sm btn-primary" @click="applyFilters">Filtrar</button>
        </div>
      </div>
    </div>
    
    <div v-if="ordersStore.loading && !ordersStore.orders.length" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="ordersStore.orders.length === 0" class="text-center p-5 text-muted">
      No hay pedidos todavía con estos filtros.
    </div>

    <div v-else class="orders">
      <div 
        v-for="order in ordersStore.orders" 
        :key="order.id"
        class="order-item"
        :class="{ active: ordersStore.currentOrder?.id === order.id }"
        @click="selectOrder(order)"
      >
        <span class="order-info">
          <span class="order-meta">
            <span class="order-number">#{{ order.id.substring(0, 8) }}</span>
            <span class="order-status" :class="getStatusClass(order.status)">
              {{ formatStatus(order.status) }}
            </span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </span>
          <!-- Show first few items for context -->
          <span class="order-summary text-muted small text-truncate" style="max-width: 350px;">
             {{ order.items?.map(i => `${i.quantity} ${i.unit} ${i.product?.name || i.productName}`).join(', ') }}
          </span>
        </span>
        <span><i class="bi bi-chevron-right"></i></span>
      </div>
      
      <!-- Pagination Controls (Simple) -->
      <div class="d-flex justify-content-center gap-2 mt-3 mb-3">
        <button 
          class="btn btn-sm btn-outline-secondary" 
          :disabled="ordersStore.pagination.page <= 1"
          @click="ordersStore.fetchOrders(ordersStore.pagination.page - 1)"
        >
          Anterior
        </button>
        <span class="align-self-center">Página {{ ordersStore.pagination.page }}</span>
        <button 
          class="btn btn-sm btn-outline-secondary" 
          :disabled="ordersStore.orders.length < ordersStore.pagination.limit"
          @click="ordersStore.fetchOrders(ordersStore.pagination.page + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { getProducts } from '@/services/productsService'

const ordersStore = useOrdersStore()
const products = ref([])
const selectedProductIds = ref([])
const productSearch = ref('')
const showProductDropdown = ref(false)
const productDropdownRef = ref(null)

const filteredProducts = computed(() => {
  if (!productSearch.value.trim()) return products.value
  const q = productSearch.value.toLowerCase()
  return products.value.filter(p => p.name.toLowerCase().includes(q))
})

function handleOutsideClick(e) {
  if (productDropdownRef.value && !productDropdownRef.value.contains(e.target)) {
    showProductDropdown.value = false
  }
}

onMounted(async () => {
  ordersStore.fetchOrders()
  products.value = await getProducts()
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

function applyFilters() {
  ordersStore.filters.productIds = selectedProductIds.value
  ordersStore.fetchOrders(1)
}

function clearFilters() {
    ordersStore.filters.startDate = ''
    ordersStore.filters.endDate = ''
    ordersStore.filters.status = ''
    ordersStore.filters.productIds = []
    selectedProductIds.value = []
    setTimeout(() => {
        ordersStore.fetchOrders(1)
    }, 0)
}

const emit = defineEmits(['order-selected'])

function selectOrder(order) {
  ordersStore.currentOrder = order
  emit('order-selected', order)
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
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.listcontainer {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 80vh;
  overflow-y: auto;
  padding-right: 1rem;
}

h3 {
  font-family: var(--font-text);
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 0; /* Remove bottom margin as it's in header-actions */
  color: #333;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.orders {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border: 1px solid transparent;
  transition: all 0.2s;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.order-item.active {
  border-color: var(--color-primary);
  background-color: #f0f7ff;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.order-number {
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
}

.order-date {
  font-size: 0.8rem;
  color: #999;
}

/* ── Responsive tablet ──── */
@media (max-width: 1023px) {
  .listcontainer {
    width: 100%;
    height: auto;
    max-height: 70vh;
    padding-right: 0;
  }

  .order-item {
    padding: 0.85rem 1rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .header-actions .d-flex {
    width: 100%;
  }

  .header-actions select,
  .header-actions input {
    font-size: 0.9rem;
  }
}

/* ── Multi-product dropdown ──── */
.product-dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 280px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  z-index: 100;
  overflow: hidden;
}

.product-dropdown-search {
  padding: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.product-dropdown-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.product-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.15s;
}

.product-dropdown-item:hover {
  background: #f0f7ff;
}

.product-dropdown-item input[type="checkbox"] {
  flex-shrink: 0;
  accent-color: var(--color-primary, #0d6efd);
}

.product-dropdown-footer {
  padding: 0.4rem 0.75rem;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  text-align: right;
}
</style>