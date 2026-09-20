import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: () => import('./views/HomeView.vue')
  },
  {
    path: '/spend',
    component: () => import('./views/SpendView.vue')
  },
  {
    path: '/save',
    component: () => import('./views/SaveView.vue')
  },
  {
    path: '/loans',
    component: () => import('./views/LoansView.vue')
  },
  {
    path: '/me',
    component: () => import('./views/MeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
