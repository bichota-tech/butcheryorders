<template>
    <div class="pedidos-page">
        <h2>Pedidos Recientes</h2>

        <!-- Tablet tab switcher (hidden on desktop) -->
        <div class="panel-tabs" v-if="isMobile">
            <button
              class="panel-tab"
              :class="{ active: activePanel === 'list' }"
              @click="activePanel = 'list'"
            >
              <i class="bi bi-list-ul me-1"></i> Lista
            </button>
            <button
              class="panel-tab"
              :class="{ active: activePanel === 'detail' }"
              @click="activePanel = 'detail'"
              :disabled="!ordersStore.currentOrder"
            >
              <i class="bi bi-file-text me-1"></i> Detalle
            </button>
        </div>

        <div class="ordercontainer">
            <OrderList :class="{ 'panel-hidden': isMobile && activePanel !== 'list' }" @order-selected="onOrderSelected" />
            <Card :class="{ 'panel-hidden': isMobile && activePanel !== 'detail' }" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Card from '@/components/card.vue';
import OrderList from '@/components/orderlist.vue'
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()
const activePanel = ref('list')
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 1024)

function onResize() { windowWidth.value = window.innerWidth }
function onOrderSelected() { if (isMobile.value) activePanel.value = 'detail' }

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.pedidos-page {
    width: 100%;
    padding: 0 1rem;
}

h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-align: center;
    font-family: var(--font-text);
    font-weight: 600;
    font-size: 1.8rem;
}

.ordercontainer {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    width: 100%;
}

/* Tablet / mobile tab switcher */
.panel-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    background: #f1f3f5;
    padding: 0.35rem;
    border-radius: 12px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
}

.panel-tab {
    padding: 0.5rem 1.2rem;
    border: none;
    border-radius: 9px;
    background: transparent;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #6c757d;
}
.panel-tab.active {
    background: white;
    color: var(--color-primary, #0d6efd);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.panel-tab:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* Below 1024px: full-width panels shown/hidden by tabs */
@media (max-width: 1023px) {
    .ordercontainer {
        flex-direction: column;
        gap: 0;
    }
    .panel-hidden {
        display: none !important;
    }
}
</style>
