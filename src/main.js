// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/tailwind.css'


createApp(App).use(createPinia()).use(router).mount('#app')
