import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import ToastPlugin from 'vue-toast-notification';

createApp(App).use(router).use(ToastPlugin).mount('#app')