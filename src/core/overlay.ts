import { extractMetadata, identifyComponent } from './identifier';

type OverlayController = {
  start: () => void;
  stop: () => void;
  isActive: () => boolean;
  highlight: (el: HTMLElement | null) => void;
  clear: () => void;
  setStyle: (style: OverlayStyle) => void;
};

export type OverlayStyle = Record<string, string>;

export type OverlayOptions = {
  overlayStyle?: OverlayStyle;
};

function createOverlayElement(targetWindow: Window, options?: OverlayOptions) {
  const el = targetWindow.document.createElement('div');
  el.setAttribute('data-vue-grab-overlay', 'true');
  el.style.position = 'fixed';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '2147483647';
  el.style.border = '2px solid #e67e22';
  el.style.background = 'rgba(230, 126, 34, 0.08)';
  el.style.top = '0';
  el.style.left = '0';
  el.style.width = '0';
  el.style.height = '0';
  if (options?.overlayStyle) {
    for (const [key, value] of Object.entries(options.overlayStyle)) {
      (el.style as any)[key] = value;
    }
  }
  return el;
}

function updateOverlayPosition(overlay: HTMLDivElement, rect: DOMRect) {
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function serializeMetadata(metadata: ReturnType<typeof extractMetadata>) {
  return JSON.stringify(metadata ?? {}, null, 2);
}

async function copyToClipboard(targetWindow: Window, text: string) {
  const clipboard = targetWindow.navigator.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(text);
    return;
  }

  const textarea = targetWindow.document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  targetWindow.document.body.appendChild(textarea);
  textarea.select();
  if (typeof targetWindow.document.execCommand === 'function') {
    targetWindow.document.execCommand('copy');
  }
  textarea.remove();
}

export function createOverlayController(
  targetWindow: Window,
  options?: OverlayOptions
): OverlayController {
  let overlay: HTMLDivElement | null = null;
  let active = false;
  let overlayStyle: OverlayStyle = options?.overlayStyle ?? {};

  const ensureOverlay = () => {
    if (!overlay) {
      overlay = createOverlayElement(targetWindow, {
        overlayStyle
      });
      targetWindow.document.body.appendChild(overlay);
    }
    return overlay;
  };

  const handleMove = (event: MouseEvent) => {
    const activeOverlay = ensureOverlay();
    const el = targetWindow.document.elementFromPoint(event.clientX, event.clientY) as
      | HTMLElement
      | null;
    if (!el) {
      activeOverlay.style.width = '0';
      activeOverlay.style.height = '0';
      return;
    }
    const rect = el.getBoundingClientRect();
    updateOverlayPosition(activeOverlay, rect);
  };

  const handleClick = (event: MouseEvent) => {
    const el = event.target as HTMLElement | null;
    const instance = identifyComponent(el);
    const metadata = extractMetadata(instance);
    void copyToClipboard(targetWindow, serializeMetadata(metadata));
  };

  return {
    start() {
      if (active) return;
      active = true;
      ensureOverlay();
      targetWindow.document.addEventListener('mousemove', handleMove);
      targetWindow.document.addEventListener('click', handleClick);
    },
    stop() {
      if (!active) return;
      active = false;
      targetWindow.document.removeEventListener('mousemove', handleMove);
      targetWindow.document.removeEventListener('click', handleClick);
      overlay?.remove();
      overlay = null;
    },
    isActive() {
      return active;
    },
    highlight(el: HTMLElement | null) {
      if (!el) {
        this.clear();
        return;
      }
      const activeOverlay = ensureOverlay();
      const rect = el.getBoundingClientRect();
      updateOverlayPosition(activeOverlay, rect);
    },
    clear() {
      if (!overlay) return;
      overlay.style.width = '0';
      overlay.style.height = '0';
    },
    setStyle(style: OverlayStyle) {
      overlayStyle = style;
      if (!overlay) return;
      for (const [key, value] of Object.entries(style)) {
        (overlay.style as any)[key] = value;
      }
    }
  };
}
