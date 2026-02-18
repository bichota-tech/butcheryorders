<template>
  <div id="app">
    <Navbar v-if="!hideLayout" />
    <main id="app-content" :class="{ 'd-flex align-items-center justify-content-center': hideLayout }">
      <router-view />
    </main>
    <Footer v-if="!hideLayout" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Footer from './components/footer.vue'
import Navbar from './components/navbar.vue'

const route = useRoute()
const hideLayout = computed(() => ['Login', 'Register'].includes(route.name))
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-bg: #f8f9fa; /* Light gray background */
}

#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
}

#app-content {
  background-color: var(--color-bg);
  flex: 1;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
}
</style>
