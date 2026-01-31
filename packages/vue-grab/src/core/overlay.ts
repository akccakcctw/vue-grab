import { extractMetadata, identifyComponent } from './identifier.js';

type OverlayController = {
  start: () => void;
  stop: () => void;
  isActive: () => boolean;
  highlight: (el: HTMLElement | null) => void;
  clear: () => void;
  setStyle: (style: OverlayStyle) => void;
  setDomFileResolver: (resolver: OverlayOptions['domFileResolver']) => void;
};

export type OverlayStyle = Record<string, string>;

export type OverlayOptions = {
  overlayStyle?: OverlayStyle;
  onCopy?: (payload: string) => void;
  onAfterCopy?: () => void;
  onAgentTask?: (task: any) => void;
  copyOnClick?: boolean;
  rootDir?: string;
  domFileResolver?: (el: HTMLElement) => {
    file?: string;
    line?: number;
    column?: number;
  } | null;
};

const IGNORE_EVENTS_ATTR = 'data-vue-grab-ignore-events';
const CONTEXT_MENU_ATTR = 'data-vue-grab-context';
const CONTEXT_MENU_ITEM_ATTR = 'data-vue-grab-context-item';
const CONTEXT_MENU_HINT = 'Right click for options';

function isIgnoredTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(`[${IGNORE_EVENTS_ATTR}]`));
}

function createContextMenuElement(targetWindow: Window) {
  const doc = targetWindow.document;
  const menu = doc.createElement('div');
  menu.setAttribute(CONTEXT_MENU_ATTR, '');
  menu.setAttribute(IGNORE_EVENTS_ATTR, '');
  Object.assign(menu.style, {
    position: 'fixed',
    zIndex: '2147483647',
    minWidth: '140px',
    padding: '6px 0',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: '#fff',
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.18)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '12px',
    color: '#111',
    display: 'none',
    pointerEvents: 'auto'
  });

  const createItem = (label: string, value: string) => {
    const item = doc.createElement('button');
    item.type = 'button';
    item.textContent = label;
    item.setAttribute(CONTEXT_MENU_ITEM_ATTR, value);
    Object.assign(item.style, {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      background: 'transparent',
      padding: '6px 12px',
      cursor: 'pointer',
      color: 'inherit',
      font: 'inherit'
    });
    item.addEventListener('mouseenter', () => {
      item.style.background = 'rgba(0, 0, 0, 0.06)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    menu.appendChild(item);
    return item;
  };

  const copyItem = createItem('Copy', 'copy');
  const copyHtmlItem = createItem('Copy HTML', 'copy-html');

  return { menu, copyItem, copyHtmlItem };
}

function positionContextMenu(
  menu: HTMLDivElement,
  x: number,
  y: number,
  targetWindow: Window
) {
  const padding = 8;
  const maxLeft = targetWindow.innerWidth - menu.offsetWidth - padding;
  const maxTop = targetWindow.innerHeight - menu.offsetHeight - padding;
  const left = Math.max(padding, Math.min(x, maxLeft));
  const top = Math.max(padding, Math.min(y, maxTop));
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

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
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.gap = '2px';
  el.style.whiteSpace = 'nowrap';
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.12s ease';

  const primary = targetWindow.document.createElement('div');
  primary.setAttribute('data-vue-grab-tooltip-line', 'primary');
  primary.style.whiteSpace = 'nowrap';

  const secondary = targetWindow.document.createElement('div');
  secondary.setAttribute('data-vue-grab-tooltip-line', 'secondary');
  secondary.style.whiteSpace = 'nowrap';
  secondary.style.color = 'rgba(255, 255, 255, 0.65)';
  secondary.style.fontSize = '10px';

  el.append(primary, secondary);
  return { tooltip: el, primary, secondary };
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
  if (metadata.file === 'unknown') return metadata.name || '';
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

function createAgentDialogElement(targetWindow: Window) {
  const doc = targetWindow.document;
  const dialog = doc.createElement('div');
  dialog.setAttribute('data-vue-grab-agent-dialog', 'true');
  dialog.setAttribute(IGNORE_EVENTS_ATTR, '');
  Object.assign(dialog.style, {
    position: 'fixed',
    zIndex: '2147483648',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    padding: '16px',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  });

  const title = doc.createElement('div');
  title.textContent = 'Ask Agent';
  Object.assign(title.style, {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111'
  });

  const textarea = doc.createElement('textarea');
  textarea.placeholder = 'What would you like to change? (e.g., "Make this button red")';
  Object.assign(textarea.style, {
    width: '100%',
    height: '80px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    resize: 'vertical',
    fontFamily: 'inherit',
    fontSize: '13px'
  });

  const footer = doc.createElement('div');
  Object.assign(footer.style, {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  });

  const cancelBtn = doc.createElement('button');
  cancelBtn.textContent = 'Cancel';
  Object.assign(cancelBtn.style, {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#f5f5f5',
    cursor: 'pointer',
    fontSize: '13px'
  });

  const submitBtn = doc.createElement('button');
  submitBtn.textContent = 'Send Task';
  Object.assign(submitBtn.style, {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px'
  });

  footer.append(cancelBtn, submitBtn);
  dialog.append(title, textarea, footer);

  return { dialog, textarea, cancelBtn, submitBtn };
}

export function createOverlayController(
  targetWindow: Window,
  options?: OverlayOptions
): OverlayController {
  let overlay: HTMLDivElement | null = null;
  let tooltip: HTMLDivElement | null = null;
  let tooltipPrimary: HTMLDivElement | null = null;
  let tooltipSecondary: HTMLDivElement | null = null;
  let contextMenu: HTMLDivElement | null = null;
  let contextMenuTarget: HTMLElement | null = null;
  let agentDialog: HTMLDivElement | null = null;
  let currentHoveredElement: HTMLElement | null = null;
  let active = false;
  let overlayStyle: OverlayStyle = options?.overlayStyle ?? {};
  let domFileResolver = options?.domFileResolver;

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
      const created = createTooltipElement(targetWindow);
      tooltip = created.tooltip;
      tooltipPrimary = created.primary;
      tooltipSecondary = created.secondary;
      targetWindow.document.body.appendChild(tooltip);
    }
    return tooltip;
  };

  const setTooltipText = (primaryText: string, secondaryText?: string) => {
    ensureTooltip();
    if (tooltipPrimary) {
      tooltipPrimary.textContent = primaryText;
    }
    if (tooltipSecondary) {
      if (secondaryText) {
        tooltipSecondary.textContent = secondaryText;
        tooltipSecondary.style.display = 'block';
      } else {
        tooltipSecondary.textContent = '';
        tooltipSecondary.style.display = 'none';
      }
    }
  };

  const ensureContextMenu = () => {
    if (!contextMenu) {
      const created = createContextMenuElement(targetWindow);
      contextMenu = created.menu;
      created.copyItem.addEventListener('click', handleMenuCopy);
      created.copyHtmlItem.addEventListener('click', handleMenuCopyHtml);
      targetWindow.document.body.appendChild(contextMenu);
    }
    return contextMenu;
  };

  const hideContextMenu = () => {
    if (!contextMenu) return;
    contextMenu.style.display = 'none';
    contextMenuTarget = null;
  };

  const showContextMenu = (x: number, y: number, target: HTMLElement) => {
    const menu = ensureContextMenu();
    contextMenuTarget = target;
    menu.style.display = 'block';
    positionContextMenu(menu, x, y, targetWindow);
  };

  const closeAgentDialog = () => {
    if (agentDialog) {
      agentDialog.remove();
      agentDialog = null;
    }
  };

  const openAgentDialog = (target: HTMLElement) => {
    if (agentDialog) return;
    const created = createAgentDialogElement(targetWindow);
    agentDialog = created.dialog;
    
    created.cancelBtn.onclick = closeAgentDialog;
    
    created.submitBtn.onclick = () => {
        const prompt = created.textarea.value;
        if (!prompt.trim()) return;

        const metadata = resolveMetadata(target);
        if (metadata && options?.onAgentTask) {
            const safePayload = {
                prompt,
                name: metadata.name,
                file: metadata.file,
                line: metadata.line,
                column: metadata.column,
                props: safeClone(metadata.props, new WeakSet(), 3),
                data: safeClone(metadata.data, new WeakSet(), 3)
            };
            options.onAgentTask(safePayload);
        }
        closeAgentDialog();
    };

    targetWindow.document.body.appendChild(agentDialog);
    created.textarea.focus();
  };

  const resolveMetadata = (el: HTMLElement | null) => {
    if (!el) return null;
    const instance = identifyComponent(el);
    const fallback = !instance && domFileResolver ? domFileResolver(el) : null;
    const metadata = extractMetadata(instance, el);
    if (!metadata) return null;
    if (fallback?.file) metadata.file = fallback.file;
    if (typeof fallback?.line === 'number') metadata.line = fallback.line;
    if (typeof fallback?.column === 'number') metadata.column = fallback.column;
    return metadata;
  };

  const applyCopyFeedback = () => {
    const activeTooltip = ensureTooltip();
    setTooltipText('Copied!');
    activeTooltip.style.background = '#27ae60';
  };

  const finishCopy = () => {
    if (options?.onAfterCopy) {
      options.onAfterCopy();
    }
  };

  const copyMetadataForElement = (el: HTMLElement | null) => {
    const metadata = resolveMetadata(el);
    if (!metadata) return;
    const payload = serializeMetadata(metadata);
    applyCopyFeedback();
    if (options?.onCopy) {
      options.onCopy(payload);
      setTimeout(finishCopy, 600);
      return;
    }
    void copyToClipboard(targetWindow, payload).then(() => {
      setTimeout(finishCopy, 600);
    });
  };

  const copyHtmlForElement = (el: HTMLElement | null) => {
    if (!el) return;
    applyCopyFeedback();
    void copyToClipboard(targetWindow, el.outerHTML).then(() => {
      setTimeout(finishCopy, 600);
    });
  };

  const handleMove = (event: MouseEvent) => {
    if (isIgnoredTarget(event.target)) return;
    const activeOverlay = ensureOverlay();
    const activeTooltip = ensureTooltip();
    const el = targetWindow.document.elementFromPoint(event.clientX, event.clientY) as
      | HTMLElement
      | null;
      
    currentHoveredElement = el;

    if (!el) {
      activeOverlay.style.width = '0';
      activeOverlay.style.height = '0';
      activeTooltip.style.opacity = '0';
      return;
    }
    const rect = el.getBoundingClientRect();
    updateOverlayPosition(activeOverlay, rect);

    const metadata = resolveMetadata(el);
    if (!metadata) {
      activeTooltip.style.opacity = '0';
      return;
    }
    const label = formatLocation(metadata, options?.rootDir);
    if (label) {
      setTooltipText(label, CONTEXT_MENU_HINT);
      updateTooltipPosition(activeTooltip, rect, targetWindow);
      activeTooltip.style.opacity = '1';
    } else {
      activeTooltip.style.opacity = '0';
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (contextMenu?.style.display === 'block') {
      const target = event.target as HTMLElement | null;
      if (!target || !contextMenu.contains(target)) {
        event.preventDefault();
        event.stopPropagation();
        hideContextMenu();
        return;
      }
    }
    // Prevent clicking "through" the agent dialog
    if (agentDialog && agentDialog.contains(event.target as Node)) {
        return;
    }

    if (options?.copyOnClick === false) return;
    if (isIgnoredTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    const el = event.target as HTMLElement | null;
    copyMetadataForElement(el);
  };

  const handleContextMenu = (event: MouseEvent) => {
    if (isIgnoredTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    const el = event.target as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    updateOverlayPosition(ensureOverlay(), rect);
    showContextMenu(event.clientX, event.clientY, el);
  };

  const handleMenuCopy = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = contextMenuTarget;
    hideContextMenu();
    copyMetadataForElement(target);
  };

  const handleMenuCopyHtml = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = contextMenuTarget;
    hideContextMenu();
    copyHtmlForElement(target);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideContextMenu();
      closeAgentDialog();
      return;
    }
    if (event.key === 'x' && (event.ctrlKey || event.metaKey)) {
        if (currentHoveredElement) {
            event.preventDefault();
            openAgentDialog(currentHoveredElement);
        }
    }
  };

  return {
    start() {
      if (active) return;
      active = true;
      ensureOverlay();
      targetWindow.document.addEventListener('mousemove', handleMove);
      targetWindow.document.addEventListener('click', handleClick, true);
      targetWindow.document.addEventListener('contextmenu', handleContextMenu, true);
      targetWindow.document.addEventListener('keydown', handleKeyDown, true);
    },
    stop() {
      if (!active) return;
      active = false;
      targetWindow.document.removeEventListener('mousemove', handleMove);
      targetWindow.document.removeEventListener('click', handleClick, true);
      targetWindow.document.removeEventListener('contextmenu', handleContextMenu, true);
      targetWindow.document.removeEventListener('keydown', handleKeyDown, true);
      overlay?.remove();
      overlay = null;
      tooltip?.remove();
      tooltip = null;
      tooltipPrimary = null;
      tooltipSecondary = null;
      contextMenu?.remove();
      contextMenu = null;
      contextMenuTarget = null;
      closeAgentDialog();
      currentHoveredElement = null;
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
    },
    setDomFileResolver(resolver: OverlayOptions['domFileResolver']) {
      domFileResolver = resolver;
    }
  };
}
