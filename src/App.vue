<template>
  <div id="app">
    <Navbar />
    <main id="app-content">
      <router-view />
    </main>
    <Footer></Footer>
  </div>
</template>

<script setup>
import Footer from './components/footer.vue';
import Navbar from './components/navbar.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

#app-content {
  background-color: var(--color-bg);
  flex: 1;
  overflow-y: auto;
  z-index: -1;
}
</style>
