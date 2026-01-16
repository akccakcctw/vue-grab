import { extractMetadata, identifyComponent } from './identifier';
import { createOverlayController } from './overlay';
import type { OverlayOptions } from './overlay';

export interface ComponentInfo {
  name: string;
  file: string;
  props: Record<string, any>;
  data: Record<string, any>;
  element: HTMLElement;
  line?: number;
  column?: number;
  vnode?: any;
}

export type VueGrabOptions = OverlayOptions;

export interface VueGrabAPI {
  activate(): void;
  deactivate(): void;
  readonly isActive: boolean;
  grabAt(x: number, y: number): ComponentInfo | null;
  grabFromSelector(selector: string): ComponentInfo | null;
  highlight(selector: string): void;
  enable(): void;
  disable(): void;
  getComponentDetails(selectorOrElement: string | Element): ComponentInfo | null;
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

export function createVueGrabAPI(
  targetWindow: Window,
  options: VueGrabOptions = {}
): VueGrabAPI {
  let active = false;
  const overlay = createOverlayController(targetWindow, options);

  return {
    activate() {
      active = true;
      overlay.start();
    },
    deactivate() {
      active = false;
      overlay.stop();
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
    },
    highlight(selector: string) {
      const el = targetWindow.document.querySelector(selector) as HTMLElement | null;
      overlay.highlight(el);
    },
    enable() {
      this.activate();
    },
    disable() {
      this.deactivate();
    },
    getComponentDetails(selectorOrElement: string | Element) {
      if (typeof selectorOrElement === 'string') {
        const el = targetWindow.document.querySelector(selectorOrElement) as
          | HTMLElement
          | null;
        return getComponentInfo(el);
      }
      return getComponentInfo(selectorOrElement as HTMLElement);
    }
  };
}

export function installVueGrab(targetWindow: Window, options: VueGrabOptions = {}) {
  const existing = (targetWindow as any).__VUE_GRAB__ as VueGrabAPI | undefined;
  if (existing) return existing;

  const api = createVueGrabAPI(targetWindow, options);
  (targetWindow as any).__VUE_GRAB__ = api;
  return api;
}
