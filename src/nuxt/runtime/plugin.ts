import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { installVueGrab } from '../../core/api';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public?.vueGrab ?? {};
  if (config.enabled === false) return;
  if (process.client && typeof window !== 'undefined') {
    installVueGrab(window, {
      overlayStyle: config.overlayStyle
    });
  }
});
