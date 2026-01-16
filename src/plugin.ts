import { installVueGrab } from './core/api';
import type { VueGrabOptions } from './core/api';

export type VueGrabPluginOptions = VueGrabOptions & {
  enabled?: boolean;
};

function isDevEnvironment() {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return Boolean((import.meta as any).env.DEV);
  }
  
  try {
    const globalScope = 
      typeof globalThis !== 'undefined' ? globalThis : 
      typeof window !== 'undefined' ? window : 
      typeof self !== 'undefined' ? self : 
      typeof global !== 'undefined' ? global : {};

    const proc = (globalScope as any).process;
    if (proc && proc.env) {
      return proc.env.NODE_ENV !== 'production';
    }
  } catch {
    // ignore
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
          copyOnClick: options.copyOnClick,
          rootDir: options.rootDir,
          domFileResolver: options.domFileResolver
        });
      }
    }
  };
}

export default createVueGrabPlugin();
