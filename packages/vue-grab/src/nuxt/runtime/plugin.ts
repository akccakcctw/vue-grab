import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { installVueGrab } from '../../core/api.js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public?.vueGrab ?? {};
  if (config.enabled === false) return;
  if (typeof window === 'undefined') return;
  
  const options: any = {
    overlayStyle: config.overlayStyle,
    copyOnClick: config.copyOnClick,
    rootDir: config.rootDir
  };

  if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
    options.onAgentTask = (task: any) => {
      (import.meta as any).hot.send('vue-grab:agent-task', task);
    };
  }

  installVueGrab(window, options);
});
