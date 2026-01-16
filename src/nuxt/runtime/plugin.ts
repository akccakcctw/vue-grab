import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { installVueGrab } from '../../core/api';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public?.vueGrab ?? {};
  if (config.enabled === false) return;
  if (typeof window === 'undefined') return;
  installVueGrab(window, {
    overlayStyle: config.overlayStyle,
    copyOnClick: config.copyOnClick,
    rootDir: config.rootDir
  });
});
