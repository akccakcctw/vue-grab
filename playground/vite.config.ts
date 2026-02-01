import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVueGrabVitePlugin } from '@akccakcctw/vue-grab/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const grabEnabled = mode === 'development' || env.VITE_VUE_GRAB === 'true'

  return {
    base: process.env.BASE_URL ?? '/',
    plugins: [vue(), createVueGrabVitePlugin({ enabled: grabEnabled })],
  }
})
