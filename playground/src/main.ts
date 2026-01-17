import { createApp } from 'vue'
import { createVueGrabPlugin } from '@akccakcctw/vue-grab'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(
  createVueGrabPlugin({
    copyOnClick: true,
  })
)

app.mount('#app')
