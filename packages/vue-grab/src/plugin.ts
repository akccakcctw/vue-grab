import { installVueGrab } from './core/api.js';
import type { VueGrabOptions } from './core/api.js';

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
        const overlayOptions: VueGrabOptions = {};
        if (options.overlayStyle !== undefined) {
          overlayOptions.overlayStyle = options.overlayStyle;
        }
        if (options.onCopy !== undefined) {
          overlayOptions.onCopy = options.onCopy;
        }
        if (options.copyOnClick !== undefined) {
          overlayOptions.copyOnClick = options.copyOnClick;
        }
        if (options.rootDir !== undefined) {
          overlayOptions.rootDir = options.rootDir;
        }
        if (options.domFileResolver !== undefined) {
          overlayOptions.domFileResolver = options.domFileResolver;
        }

        if (options.onAgentTask !== undefined) {
          overlayOptions.onAgentTask = options.onAgentTask;
        } else if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
           overlayOptions.onAgentTask = (task) => {
             (import.meta as any).hot.send('vue-grab:agent-task', task);
           };
        }

        installVueGrab(window, overlayOptions);
      }
    }
  };
}

export default createVueGrabPlugin();
