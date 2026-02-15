<template>
  <div class="voice-bottom">
    <router-link to="/new-order" class="voice-button shadow transition">
      <i class="bi bi-mic-fill me-2"></i> Añadir Pedido
    </router-link>
  </div>
</template>

<style scoped>
.voice-bottom {
  width: 40%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.voice-button { 
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 1.5rem;
  font-family: var(--font-text);
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 3rem 1rem;
  border-radius: 25px;
  text-decoration: none;
  transition: transform 0.2s;
  cursor: pointer;
}

.voice-button:hover {
  transform: translateY(-5px);
  background-color: #0b5ed7;
  color: white;
}
</style>