type ToggleWidgetOptions = {
  onToggle: (nextActive: boolean) => void;
};

type ToggleWidgetController = {
  mount: () => void;
  unmount: () => void;
  setActive: (active: boolean) => void;
};

type DragState = {
  dragging: boolean;
  offsetX: number;
  offsetY: number;
};

function createButton(targetWindow: Window) {
  const button = targetWindow.document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-vue-grab-toggle', 'true');
  button.style.position = 'fixed';
  button.style.right = '16px';
  button.style.bottom = '16px';
  button.style.zIndex = '2147483647';
  button.style.border = '1px solid #111';
  button.style.borderRadius = '999px';
  button.style.padding = '8px 12px';
  button.style.fontSize = '12px';
  button.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  button.style.background = '#fff';
  button.style.color = '#111';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  button.style.pointerEvents = 'auto';
  return button;
}

function setButtonState(button: HTMLButtonElement, active: boolean) {
  button.textContent = active ? 'Vue Grab: ON' : 'Vue Grab: OFF';
  button.style.background = active ? '#111' : '#fff';
  button.style.color = active ? '#fff' : '#111';
}

export function createToggleWidget(
  targetWindow: Window,
  options: ToggleWidgetOptions
): ToggleWidgetController {
  let button: HTMLButtonElement | null = null;
  let mounted = false;
  const dragState: DragState = {
    dragging: false,
    offsetX: 0,
    offsetY: 0
  };

  const startDrag = (event: MouseEvent) => {
    if (!button) return;
    dragState.dragging = true;
    const rect = button.getBoundingClientRect();
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    button.style.left = `${rect.left}px`;
    button.style.top = `${rect.top}px`;
  };

  const onDrag = (event: MouseEvent) => {
    if (!button || !dragState.dragging) return;
    const nextLeft = event.clientX - dragState.offsetX;
    const nextTop = event.clientY - dragState.offsetY;
    const maxLeft = targetWindow.innerWidth - button.offsetWidth;
    const maxTop = targetWindow.innerHeight - button.offsetHeight;
    const clampedLeft = Math.max(0, Math.min(maxLeft, nextLeft));
    const clampedTop = Math.max(0, Math.min(maxTop, nextTop));
    button.style.left = `${clampedLeft}px`;
    button.style.top = `${clampedTop}px`;
  };

  const endDrag = () => {
    dragState.dragging = false;
  };

  return {
    mount() {
      if (mounted) return;
      mounted = true;
      button = createButton(targetWindow);
      setButtonState(button, false);
      button.addEventListener('mousedown', startDrag);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const nextActive = button?.textContent !== 'Vue Grab: ON';
        options.onToggle(nextActive);
      });
      targetWindow.addEventListener('mousemove', onDrag);
      targetWindow.addEventListener('mouseup', endDrag);
      targetWindow.document.body.appendChild(button);
    },
    unmount() {
      if (!mounted) return;
      mounted = false;
      button?.removeEventListener('mousedown', startDrag);
      button?.remove();
      button = null;
      targetWindow.removeEventListener('mousemove', onDrag);
      targetWindow.removeEventListener('mouseup', endDrag);
    },
    setActive(active: boolean) {
      if (!button) return;
      setButtonState(button, active);
    }
  };
}
