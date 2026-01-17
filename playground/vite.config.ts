import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVueGrabVitePlugin } from '@akccakcctw/vue-grab'

export default defineConfig({
  plugins: [vue(), createVueGrabVitePlugin()],
})
