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
  onCopy?: (payload: string) => void;
  copyOnClick?: boolean;
  rootDir?: string;
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

function createTooltipElement(targetWindow: Window) {
  const el = targetWindow.document.createElement('div');
  el.setAttribute('data-vue-grab-tooltip', 'true');
  el.style.position = 'fixed';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '2147483647';
  el.style.padding = '4px 8px';
  el.style.borderRadius = '6px';
  el.style.background = '#111';
  el.style.color = '#fff';
  el.style.fontSize = '11px';
  el.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  el.style.whiteSpace = 'nowrap';
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.12s ease';
  return el;
}

function updateTooltipPosition(
  tooltip: HTMLDivElement,
  rect: DOMRect,
  targetWindow: Window
) {
  const offset = 6;
  const top = rect.top - 24 - offset;
  const nextTop = top >= 0 ? top : rect.bottom + offset;
  const maxLeft = targetWindow.innerWidth - tooltip.offsetWidth - offset;
  const maxTop = targetWindow.innerHeight - tooltip.offsetHeight - offset;
  const left = Math.max(0, Math.min(rect.left, maxLeft));
  const finalTop = Math.max(0, Math.min(nextTop, maxTop));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${finalTop}px`;
}

function formatLocation(metadata: ReturnType<typeof extractMetadata>, rootDir?: string) {
  if (!metadata?.file) return '';
  const file = (() => {
    if (rootDir && metadata.file.startsWith(rootDir)) {
      const relative = metadata.file.slice(rootDir.length).replace(/^\/+/, '');
      return relative || metadata.file;
    }
    if (metadata.file.includes('/src/')) return metadata.file.split('/src/')[1];
    return metadata.file;
  })();
  const line = typeof metadata.line === 'number' ? metadata.line : null;
  const column = typeof metadata.column === 'number' ? metadata.column : null;
  if (line !== null && column !== null) {
    return `${file}:${line}:${column}`;
  }
  return file;
}

function isVueComponentProxy(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  return (
    '$el' in value ||
    '$props' in value ||
    '$data' in value ||
    '__v_isVNode' in value ||
    '__isVue' in value
  );
}

function cloneVnode(value: Record<string, unknown>, seen: WeakSet<object>, depth: number) {
  return {
    type: safeClone(value.type, seen, depth - 1),
    key: safeClone(value.key, seen, depth - 1),
    props: safeClone(value.props, seen, depth - 1),
    children: safeClone(value.children, seen, depth - 1),
    el: safeClone(value.el, seen, depth - 1),
    shapeFlag: safeClone(value.shapeFlag, seen, depth - 1),
    patchFlag: safeClone(value.patchFlag, seen, depth - 1)
  };
}

function safeClone(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (depth <= 0) return '[DepthLimit]';
  if (value === null || typeof value !== 'object') return value;
  if (typeof value === 'function') {
    const name = value.name ? ` ${value.name}` : '';
    return `[Function${name}]`;
  }
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  let tag = '[object Object]';
  try {
    tag = Object.prototype.toString.call(value);
  } catch {
    return '[Unserializable]';
  }

  if (tag === '[object Window]') return '[Window]';
  if (tag === '[object Document]') return '[Document]';
  if (tag === '[object HTMLCollection]') return '[HTMLCollection]';
  if (tag === '[object NodeList]') return '[NodeList]';
  if (tag.startsWith('[object HTML')) return '[HTMLElement]';
  if ((value as Record<string, unknown>).__v_isVNode) {
    return cloneVnode(value as Record<string, unknown>, seen, depth);
  }
  if (isVueComponentProxy(value)) return '[VueComponent]';

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => safeClone(item, seen, depth - 1));
  }

  const result: Record<string, unknown> = {};
  let keys: string[] = [];
  try {
    keys = Object.keys(value as object).slice(0, 50);
  } catch {
    return '[Unserializable]';
  }
  for (const key of keys) {
    try {
      const item = (value as Record<string, unknown>)[key];
      result[key] = safeClone(item, seen, depth - 1);
    } catch {
      result[key] = '[Unserializable]';
    }
  }
  return result;
}

function safeStringify(value: unknown) {
  const cloned = safeClone(value ?? {}, new WeakSet(), 5);
  return JSON.stringify(cloned, null, 2);
}

function serializeMetadata(metadata: ReturnType<typeof extractMetadata>) {
  return safeStringify(metadata);
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
  let tooltip: HTMLDivElement | null = null;
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

  const ensureTooltip = () => {
    if (!tooltip) {
      tooltip = createTooltipElement(targetWindow);
      targetWindow.document.body.appendChild(tooltip);
    }
    return tooltip;
  };

  const handleMove = (event: MouseEvent) => {
    const activeOverlay = ensureOverlay();
    const activeTooltip = ensureTooltip();
    const el = targetWindow.document.elementFromPoint(event.clientX, event.clientY) as
      | HTMLElement
      | null;
    if (!el) {
      activeOverlay.style.width = '0';
      activeOverlay.style.height = '0';
      activeTooltip.style.opacity = '0';
      return;
    }
    const rect = el.getBoundingClientRect();
    updateOverlayPosition(activeOverlay, rect);

    const instance = identifyComponent(el);
    const metadata = extractMetadata(instance);
    const label = formatLocation(metadata, options?.rootDir);
    if (label) {
      activeTooltip.textContent = label;
      updateTooltipPosition(activeTooltip, rect, targetWindow);
      activeTooltip.style.opacity = '1';
    } else {
      activeTooltip.style.opacity = '0';
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (options?.copyOnClick === false) return;
    event.preventDefault();
    event.stopPropagation();
    const el = event.target as HTMLElement | null;
    const instance = identifyComponent(el);
    const metadata = extractMetadata(instance);
    const payload = serializeMetadata(metadata);
    if (options?.onCopy) {
      options.onCopy(payload);
      return;
    }
    void copyToClipboard(targetWindow, payload);
  };

  return {
    start() {
      if (active) return;
      active = true;
      ensureOverlay();
      targetWindow.document.addEventListener('mousemove', handleMove);
      targetWindow.document.addEventListener('click', handleClick, true);
    },
    stop() {
      if (!active) return;
      active = false;
      targetWindow.document.removeEventListener('mousemove', handleMove);
      targetWindow.document.removeEventListener('click', handleClick, true);
      overlay?.remove();
      overlay = null;
      tooltip?.remove();
      tooltip = null;
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
