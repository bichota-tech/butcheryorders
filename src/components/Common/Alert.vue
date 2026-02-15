<template>
  <div v-if="show" :class="['alert', alertClass, 'alert-dismissible', 'fade', 'show']" role="alert">
    <slot>{{ message }}</slot>
    <button type="button" class="btn-close" @click="close" aria-label="Close"></button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'danger', 'warning', 'info'].includes(value)
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const alertClass = computed(() => `alert-${props.type}`)

function close() {
  emit('close')
}
</script>
