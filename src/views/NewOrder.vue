<template>
  <div class="container mt-4 mb-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <h4 class="mb-0"><i class="bi bi-mic-fill me-2"></i>Nuevo Pedido por Voz</h4>
            <span class="badge bg-light text-dark" v-if="voiceStore.isRecording">Grabando...</span>
          </div>
          
          <div class="card-body p-4">
            <!-- Client Data Section -->
    <div class="mb-4 p-3 bg-light rounded">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0"><i class="bi bi-person-fill me-2"></i>Datos del Cliente</h5>
        <button v-if="hasClientData && !isEditingClientData" class="btn btn-sm btn-outline-primary" @click="isEditingClientData = true">
          <i class="bi bi-pencil"></i> Editar
        </button>
      </div>

      <!-- Summary Mode -->
      <div v-if="hasClientData && !isEditingClientData" class="row g-3">
        <div class="col-md-4">
          <small class="text-muted d-block">Nombre</small>
          <span class="fw-bold">{{ clientName }}</span>
        </div>
        <div class="col-md-4">
          <small class="text-muted d-block">Teléfono</small>
          <span class="fw-bold">{{ clientPhone }}</span>
        </div>
        <div class="col-md-4">
          <small class="text-muted d-block">Fecha de Recogida</small>
          <span class="fw-bold">{{ pickupDate }}</span>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-bold small">Nombre del Cliente</label>
          <input type="text" class="form-control" v-model="clientName" placeholder="Nombre y apellidos">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-bold small">Teléfono</label>
          <input type="tel" class="form-control" v-model="clientPhone" placeholder="Nº de teléfono">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-bold small">Fecha de Recogida</label>
          <input type="date" class="form-control" v-model="pickupDate">
        </div>
        <div class="col-12 text-end" v-if="hasClientData">
           <button class="btn btn-sm btn-secondary" @click="isEditingClientData = false">Listo</button>
        </div>
      </div>
      </div>

            <!-- Voice Control Area -->
            <div class="text-center mb-4">
              <button 
                @click="toggleRecording" 
                class="btn btn-lg rounded-circle p-4 mb-3 transition"
                :class="voiceStore.isRecording ? 'btn-danger pulse' : 'btn-primary'"
                :disabled="isProcessing"
                style="width: 100px; height: 100px;"
              >
                <i class="bi fs-1" :class="voiceStore.isRecording ? 'bi-stop-fill' : 'bi-mic-fill'"></i>
              </button>
              <p class="text-muted">
                {{ voiceStore.isRecording ? 'Escuchando... (Di el pedido del cliente)' : 'Pulsa para dictar el pedido' }}
              </p>
              
              <div v-if="voiceStore.error" class="alert alert-danger mt-3">
                {{ voiceStore.error }}
              </div>
            </div>

            <!-- Transcript Live View -->
            <div class="mb-4">
              <label class="form-label text-muted fw-bold">Transcripción</label>
              <div class="p-3 bg-light rounded border min-h-100">
                <p class="mb-0 fs-5">
                  {{ voiceStore.fullTranscript || '...' }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-center gap-2 mb-4" v-if="voiceStore.transcript && !voiceStore.isRecording">
              <button @click="processTranscript" class="btn btn-success" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                Procesar Pedido
              </button>
              <button @click="resetSession" class="btn btn-outline-secondary" :disabled="isProcessing">
                Reiniciar
              </button>
            </div>

            <!-- Pre-order Items Preview (After Processing) -->
            <div v-if="voiceStore.recognizedItems.length > 0" class="mt-4">
              <h5 class="border-bottom pb-2 mb-3">Resumen del Pedido</h5>
              
              <div class="table-responsive">
                <table class="table align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Notas</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in voiceStore.recognizedItems" :key="index">
                      <td>
                        <span v-if="item.productId" class="fw-bold text-success">{{ item.productName }}</span>
                        <span v-else class="text-warning">{{ item.productName }} (No encontrado)</span>
                      </td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unit }}</td>
                      <td>
                        <input type="text" class="form-control form-control-sm" v-model="item.notes" placeholder="Detalles...">
                      </td>
                      <td>
                        <i v-if="item.productId" class="bi bi-check-circle-fill text-success"></i>
                        <i v-else class="bi bi-exclamation-triangle-fill text-warning"></i>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-danger" @click="voiceStore.removeRecognizedItem(index)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-grid mt-3">
                <button @click="confirmOrder" class="btn btn-primary btn-lg" :disabled="!isValidOrder || ordersStore.loading">
                   <span v-if="ordersStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                   Confirmar Pedido
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <!-- Instructions Side Panel -->
      <div class="col-md-4 mt-4 mt-md-0">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="card-title fw-bold"><i class="bi bi-info-circle me-2"></i>Instrucciones</h5>
            <p class="card-text text-muted small mb-2">Di el pedido completo en un solo dictado:</p>

            <div class="mb-3">
              <span class="badge bg-secondary mb-1">Formato base</span>
              <p class="small text-muted mb-0">
                <em>«Pedido para [Nombre], fecha de recogida [fecha], teléfono [número], [productos]»</em>
              </p>
            </div>

            <span class="badge bg-secondary mb-2">Ejemplos</span>
            <ul class="list-group list-group-flush small">
              <li class="list-group-item bg-transparent px-0 py-2">
                🗣 <em>«Pedido para Ana García, fecha de recogida 5 de marzo, teléfono 612345678, dos kilos de filetes de babilla finos, un kilo de carne picada y medio kilo de jamón ibérico»</em>
              </li>
              <li class="list-group-item bg-transparent px-0 py-2 example-extra">
                🗣 <em>«Pedido para Carlos Ruiz, teléfono 698765432, fecha de recogida día 10, un chuletón para parrilla, 500 gramos de solomillo y tres unidades de cachopos»</em>
              </li>
              <li class="list-group-item bg-transparent px-0 py-2 example-extra">
                🗣 <em>«Pedido para Lucía, teléfono seis uno dos cinco ocho siete nueve uno cuatro, recogida día 28, un kilo de filetes tiernos, medio kilo de redondo para asar, compango de fabada para cuatro personas»</em>
              </li>
            </ul>

            <div class="mt-3">
              <span class="badge bg-secondary mb-1">Cortes disponibles</span>
              <p class="small text-muted mb-0">Solomillo · Lomo Alto · Lomo Bajo · Babilla · Cadera · Tapa · Redondo · Contra · Chuletón · Filetes</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal/Toast placeholder -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11" v-if="showSuccessToast">
       <div class="toast show align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ¡Pedido creado correctamente!
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" @click="showSuccessToast = false"></button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal: datos incompletos -->
    <ConfirmModal
      :isOpen="showMissingDataModal"
      title="Datos incompletos"
      message="Faltan datos obligatorios: Nombre y Fecha de Recogida. ¿Deseas completarlos antes de confirmar?"
      confirmText="Entendido"
      :showCancel="false"
      type="warning"
      @confirm="showMissingDataModal = false"
      @cancel="showMissingDataModal = false"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVoiceRecording } from '@/composables/useVoiceRecording'
import { useVoiceSessionStore } from '@/stores/voiceSession'
import { useOrdersStore } from '@/stores/orders'
import * as voiceService from '@/services/voiceService'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'

const router = useRouter()
const voiceStore = useVoiceSessionStore()
const ordersStore = useOrdersStore()
const { startRecording, stopRecording, toggleRecording } = useVoiceRecording()

const isProcessing = ref(false)
const showSuccessToast = ref(false)
const showMissingDataModal = ref(false)

// Client data fields
const clientName = ref('')
const clientPhone = ref('')
const pickupDate = ref('')

const isValidOrder = computed(() => {
  return voiceStore.recognizedItems.length > 0 && voiceStore.recognizedItems.every(item => item.productId)
})

const isEditingClientData = ref(false)
const hasClientData = computed(() => !!(clientName.value || clientPhone.value || pickupDate.value))

async function processTranscript() {
  if (!voiceStore.transcript) return

  isProcessing.value = true
  try {
    const result = await voiceService.processTranscript(voiceStore.transcript)
    
    // Set Recognized Items
    if (result.items) {
      voiceStore.setRecognizedItems(result.items)
    }

    // Set Client Data if found
    if (result.clientData) {
      if (result.clientData.clientName) clientName.value = result.clientData.clientName
      if (result.clientData.clientPhone) clientPhone.value = result.clientData.clientPhone
      if (result.clientData.pickupDate) pickupDate.value = result.clientData.pickupDate
    }

  } catch (error) {
    voiceStore.setError('Error al procesar el audio. Intenta de nuevo.')
    console.error(error)
  } finally {
    isProcessing.value = false
  }
}

async function confirmOrder() {
  if (!isValidOrder.value) return

  // Validate mandatory client data (phone is optional)
  if (!clientName.value || !pickupDate.value) {
    showMissingDataModal.value = true
    return
  }

  try {
    const orderData = {
      items: voiceStore.recognizedItems,
      transcript: voiceStore.transcript,
      clientName: clientName.value || null,
      clientPhone: clientPhone.value || null,
      pickupDate: pickupDate.value || null
    }
    
    await ordersStore.createOrder(orderData)
    
    showSuccessToast.value = true
    resetSession()
    
    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/pedidos')
    }, 2000)
    
  } catch (error) {
    console.error('Failed to create order:', error)
    voiceStore.setError('Error al crear el pedido.')
  }
}

function resetSession() {
  voiceStore.reset()
  clientName.value = ''
  clientPhone.value = ''
  pickupDate.value = ''
}
</script>

<style scoped>
.min-h-100 {
  min-height: 100px;
}

.transition {
  transition: all 0.3s ease;
}

.pulse {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

/* ── Tablet responsive ──── */
@media (max-width: 1023px) {
  /* Oculta los ejemplos 2 y 3 en tablet para reducir scroll */
  .example-extra {
    display: none;
  }

  /* Panel de instrucciones más compacto */
  .col-md-4 .card-body {
    padding: 0.85rem;
  }

  /* El row principal stack en columna en tablets pequeñas */
  .container .row {
    flex-direction: column;
  }

  .col-md-8, .col-md-4 {
    width: 100%;
    max-width: 100%;
  }

  .col-md-4 {
    margin-top: 1rem !important;
  }
}

/* ── Mobile responsive table ──── */
@media (max-width: 767px) {
  /* Make table rows act like cards */
  .table-responsive table {
    display: block;
  }
  .table-responsive thead {
    display: none; /* Hide headers */
  }
  .table-responsive tbody {
    display: block;
  }
  .table-responsive tr {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  .table-responsive td {
    border: none;
    padding: 0.25rem 0;
    display: block;
  }
  
  /* Product Name (Full width) */
  .table-responsive td:nth-child(1) {
    width: 100%;
    font-size: 1.05rem;
    margin-bottom: 0.25rem;
  }
  /* Quantity */
  .table-responsive td:nth-child(2)::before {
    content: "Cant: ";
    font-size: 0.8rem;
    color: #6c757d;
  }
  .table-responsive td:nth-child(2) {
    width: 30%;
    font-weight: bold;
  }
  /* Unit */
  .table-responsive td:nth-child(3) {
    width: 20%;
    text-align: left;
  }
  /* Status Icon */
  .table-responsive td:nth-child(5) {
    width: 15%;
    text-align: right;
  }
  /* Action (Trash) */
  .table-responsive td:nth-child(6) {
    width: 15%;
    text-align: right;
  }
  
  /* Notes Input (Full width, bottom) */
  .table-responsive td:nth-child(4) {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>
