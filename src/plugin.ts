import { installVueGrab } from './core/api';
import type { VueGrabOptions } from './core/api';

export type VueGrabPluginOptions = VueGrabOptions & {
  enabled?: boolean;
};

function isDevEnvironment() {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return Boolean((import.meta as any).env.DEV);
  }
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV !== 'production';
  }
  return false;
}

export function createVueGrabPlugin(options: VueGrabPluginOptions = {}) {
  return {
    install() {
      const enabled =
        typeof options.enabled === 'boolean' ? options.enabled : isDevEnvironment();
      if (enabled && typeof window !== 'undefined') {
        installVueGrab(window, {
          overlayStyle: options.overlayStyle,
          onCopy: options.onCopy,
          copyOnClick: options.copyOnClick
        });
      }
    }
  };
}

export default createVueGrabPlugin();
