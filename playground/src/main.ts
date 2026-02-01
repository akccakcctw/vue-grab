import { createApp } from 'vue'
import { createVueGrabPlugin } from '@akccakcctw/vue-grab'
import App from './App.vue'
import './style.css'

const app = createApp(App)

const grabEnabled = import.meta.env.DEV || import.meta.env.VITE_VUE_GRAB === 'true'
app.use(
  createVueGrabPlugin({
    copyOnClick: true,
    enabled: grabEnabled,
  })
)

app.mount('#app')
