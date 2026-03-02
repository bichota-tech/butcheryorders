<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="confirm-overlay" @click.self="onCancel">
        <div class="confirm-dialog" :class="`confirm-dialog--${type}`">
          <!-- Icon -->
          <div class="confirm-icon">
            <i class="bi" :class="iconClass"></i>
          </div>

          <!-- Content -->
          <h5 class="confirm-title">{{ title }}</h5>
          <p class="confirm-message" v-if="message">{{ message }}</p>

          <!-- Actions -->
          <div class="confirm-actions">
            <button
              v-if="showCancel"
              class="btn-confirm btn-confirm--secondary"
              @click="onCancel"
            >
              <i class="bi bi-x-lg me-1"></i>{{ cancelText }}
            </button>
            <button
              class="btn-confirm"
              :class="`btn-confirm--${type}`"
              @click="onConfirm"
            >
              <i class="bi me-1" :class="confirmIconClass"></i>{{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '¿Confirmar acción?' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Aceptar' },
  cancelText: { type: String, default: 'Cancelar' },
  showCancel: { type: Boolean, default: true },
  type: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'danger', 'warning', 'success'].includes(v)
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconClass = computed(() => ({
  primary: 'bi-question-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-circle-fill',
  success: 'bi-check-circle-fill'
}[props.type]))

const confirmIconClass = computed(() => ({
  primary: 'bi-check-lg',
  danger: 'bi-trash',
  warning: 'bi-check-lg',
  success: 'bi-check-lg'
}[props.type]))

function onConfirm() { emit('confirm') }
function onCancel() { emit('cancel') }
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.confirm-dialog {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: dialog-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialog-in {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.confirm-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.8rem;
}

.confirm-dialog--primary .confirm-icon  { background: #e7f0ff; color: #0d6efd; }
.confirm-dialog--danger  .confirm-icon  { background: #fdecea; color: #dc3545; }
.confirm-dialog--warning .confirm-icon  { background: #fff8e1; color: #fd7e14; }
.confirm-dialog--success .confirm-icon  { background: #e8f8ef; color: #198754; }

.confirm-title {
  font-weight: 700;
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.confirm-message {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-confirm {
  padding: 0.6rem 1.4rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.btn-confirm--secondary {
  background: #f1f3f5;
  color: #495057;
}
.btn-confirm--secondary:hover { background: #dee2e6; }

.btn-confirm--primary  { background: #0d6efd; color: white; }
.btn-confirm--primary:hover  { background: #0b5ed7; transform: translateY(-1px); }

.btn-confirm--danger   { background: #dc3545; color: white; }
.btn-confirm--danger:hover   { background: #bb2d3b; transform: translateY(-1px); }

.btn-confirm--warning  { background: #fd7e14; color: white; }
.btn-confirm--warning:hover  { background: #e86c0a; transform: translateY(-1px); }

.btn-confirm--success  { background: #198754; color: white; }
.btn-confirm--success:hover  { background: #146c43; transform: translateY(-1px); }

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to    { opacity: 0; }
</style>
