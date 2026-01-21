import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/paleta.css' // GLOBAL
import 'bootstrap/dist/css/bootstrap.min.css'; // CSS principal
import 'bootstrap-icons/font/bootstrap-icons.css'; // CSS de los iconos

createApp(App)
  .use(router)
  .mount('#app')
