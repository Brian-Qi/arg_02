import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/fonts.css'
import './assets/styles/forum-base.css'
import './assets/styles/forum-pages.css'
import './assets/styles/forum-responsive.css'
import './assets/styles/backup.css'

createApp(App).use(router).mount('#app')
