import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupAxiosInterceptors } from './plugins/axios'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

setupAxiosInterceptors()

app.mount('#app')
