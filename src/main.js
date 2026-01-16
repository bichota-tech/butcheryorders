import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/paleta.css' // GLOBAL

createApp(App)
  .use(router)
  .mount('#app')
