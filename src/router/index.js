import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Pedidos from '@/views/Pedidos.vue'
import Formulario from '@/views/Formulario.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/pedidos', name: 'Pedidos', component: Pedidos },
  { path: '/formulario', name: 'Formulario', component: Formulario }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

