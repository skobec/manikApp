import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/authStore'
import './assets/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
// Восстанавливаем сессию до первой навигации; guard дождётся init при нужде.
useAuthStore(pinia).init()
app.mount('#app')
