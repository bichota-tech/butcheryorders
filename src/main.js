import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/paleta.css' // GLOBAL
import 'bootstrap/dist/css/bootstrap.min.css' // CSS principal
import 'bootstrap-icons/font/bootstrap-icons.css' // CSS de los iconos

const pinia = createPinia()

createApp(App).use(pinia).use(router).mount('#app')
