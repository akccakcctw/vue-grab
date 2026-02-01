import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVueGrabVitePlugin } from '@akccakcctw/vue-grab/vite'

export default defineConfig(() => ({
  base: process.env.BASE_URL ?? '/',
  plugins: [vue(), createVueGrabVitePlugin()],
}))
