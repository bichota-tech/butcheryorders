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
              <h5 class="mb-3"><i class="bi bi-person-fill me-2"></i>Datos del Cliente</h5>
              <div class="row g-3">
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
            <h5 class="card-title fw-bold">Instrucciones</h5>
            <p class="card-text text-muted">Ejemplos de qué decir:</p>
            <ul class="list-group list-group-flush">
              <li class="list-group-item bg-transparent">"Quiero 2 kilos de carne picada"</li>
              <li class="list-group-item bg-transparent">"Medio kilo de jamón y 3 unidades de chorizo"</li>
              <li class="list-group-item bg-transparent">"Un kilo de cinta de lomo"</li>
              <li class="list-group-item bg-transparent">"Tres unidades de hamburguesas"</li>
            </ul>
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

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVoiceRecording } from '@/composables/useVoiceRecording'
import { useVoiceSessionStore } from '@/stores/voiceSession'
import { useOrdersStore } from '@/stores/orders'
import * as voiceService from '@/services/voiceService'

const router = useRouter()
const voiceStore = useVoiceSessionStore()
const ordersStore = useOrdersStore()
const { startRecording, stopRecording, toggleRecording } = useVoiceRecording()

const isProcessing = ref(false)
const showSuccessToast = ref(false)

// Client data fields
const clientName = ref('')
const clientPhone = ref('')
const pickupDate = ref('')

const isValidOrder = computed(() => {
  return voiceStore.recognizedItems.length > 0 && voiceStore.recognizedItems.every(item => item.productId)
})

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

  // Validate client data
  if (!clientName.value || !clientPhone.value || !pickupDate.value) {
    alert('⚠️ Faltan datos obligatorios del cliente (Nombre, Teléfono o Fecha de Recogida).\nPor favor, complétalos antes de confirmar.')
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
</style>
