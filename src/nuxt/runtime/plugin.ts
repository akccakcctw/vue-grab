import { defineNuxtPlugin } from '#app';
import { installVueGrab } from '../../core/api';

export default defineNuxtPlugin(() => {
  if (process.client && typeof window !== 'undefined') {
    installVueGrab(window);
  }
});
