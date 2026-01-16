<template>
  <div id="app">
    <Navbar />

    <main id="app-content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Footer from './components/footer.vue';
import Navbar from './components/navbar.vue';
</script>

<style scoped>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  height: auto;
}

/* Contenido principal ocupa todo lo que sobra */
#app-content {
  flex: 1; /* crece para llenar el espacio disponible */
  overflow-y: auto; /* permite scroll si hay mucho contenido */
}
</style>
