import { extractMetadata, identifyComponent } from './identifier';

export interface ComponentInfo {
  name: string;
  file: string;
  props: Record<string, any>;
  data: Record<string, any>;
  element: HTMLElement;
}

export interface VueGrabAPI {
  activate(): void;
  deactivate(): void;
  readonly isActive: boolean;
  grabAt(x: number, y: number): ComponentInfo | null;
  grabFromSelector(selector: string): ComponentInfo | null;
}

function getComponentInfo(el: HTMLElement | null): ComponentInfo | null {
  if (!el) return null;
  const instance = identifyComponent(el);
  const metadata = extractMetadata(instance);
  if (!metadata) return null;

  return {
    ...metadata,
    element: el
  };
}

export function createVueGrabAPI(targetWindow: Window): VueGrabAPI {
  let active = false;

  return {
    activate() {
      active = true;
    },
    deactivate() {
      active = false;
    },
    get isActive() {
      return active;
    },
    grabAt(x: number, y: number) {
      if (typeof targetWindow.document.elementFromPoint !== 'function') return null;
      const el = targetWindow.document.elementFromPoint(x, y) as HTMLElement | null;
      return getComponentInfo(el);
    },
    grabFromSelector(selector: string) {
      const el = targetWindow.document.querySelector(selector) as HTMLElement | null;
      return getComponentInfo(el);
    }
  };
}

export function installVueGrab(targetWindow: Window) {
  const existing = (targetWindow as any).__VUE_GRAB__ as VueGrabAPI | undefined;
  if (existing) return existing;

  const api = createVueGrabAPI(targetWindow);
  (targetWindow as any).__VUE_GRAB__ = api;
  return api;
}
