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
  moved: boolean;
};

const CURSOR_ICON = `<svg data-v-6fdbd1c9="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 1.2em; width: 1.2em; pointer-events: none;"><g data-v-6fdbd1c9="" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle data-v-6fdbd1c9="" cx="12" cy="12" r=".5" fill="currentColor"></circle><path data-v-6fdbd1c9="" d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2"></path></g></svg>`;
const CHEVRON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="transform: rotate(180deg); pointer-events: none;"><path d="m18 15-6-6-6 6"></path></svg>`;

function createToolbar(targetWindow: Window) {
  const doc = targetWindow.document;
  const container = doc.createElement('div');
  
  // Outer Container Styles
  Object.assign(container.style, {
    position: 'fixed',
    left: '16px',
    top: '16px',
    zIndex: '2147483647',
    fontFamily: 'sans-serif',
    fontSize: '13px',
    userSelect: 'none',
    cursor: 'grab',
    filter: 'drop-shadow(0px 0px 4px rgba(81, 81, 81, 0.5))',
    transition: 'opacity 300ms ease-out, padding 0.2s ease',
    opacity: '1',
  });
  container.setAttribute('data-vue-grab-toolbar', '');
  container.setAttribute('data-vue-grab-ignore-events', '');

  const inner = doc.createElement('div');
  Object.assign(inner.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    backgroundColor: 'white',
    gap: '6px',
    padding: '6px 8px',
    transition: 'gap 0.2s ease, padding 0.2s ease',
  });
  
  // Toggle Button Wrapper
  const toggleWrapper = doc.createElement('div');
  Object.assign(toggleWrapper.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflow: 'hidden',
    maxWidth: '200px',
    transition: 'max-width 0.2s ease, opacity 0.2s ease'
  });

  // Toggle Button
  const toggleBtn = doc.createElement('button');
  toggleBtn.setAttribute('data-vue-grab-toggle', '');
  Object.assign(toggleBtn.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: '0',
    transition: 'transform 0.1s',
    color: 'rgba(0, 0, 0, 0.7)'
  });
  toggleBtn.innerHTML = CURSOR_ICON;
  toggleBtn.onmouseenter = () => toggleBtn.style.transform = 'scale(1.05)';
  toggleBtn.onmouseleave = () => toggleBtn.style.transform = 'scale(1)';

  toggleWrapper.appendChild(toggleBtn);

  // Collapse Button
  const collapseBtn = doc.createElement('button');
  collapseBtn.setAttribute('data-vue-grab-collapse', '');
  Object.assign(collapseBtn.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: '0',
    transition: 'transform 0.1s',
    color: '#B3B3B3'
  });
  collapseBtn.innerHTML = CHEVRON_ICON;
  collapseBtn.onmouseenter = () => collapseBtn.style.transform = 'scale(1.05)';
  collapseBtn.onmouseleave = () => collapseBtn.style.transform = 'scale(1)';

  inner.appendChild(toggleWrapper);
  inner.appendChild(collapseBtn);
  container.appendChild(inner);

  return { container, toggleBtn, collapseBtn, toggleWrapper };
}

function setButtonState(toggleBtn: HTMLElement, active: boolean) {
  // Use color to indicate state: Blue for active, Gray for inactive
  toggleBtn.style.color = active ? '#3b82f6' : 'rgba(0, 0, 0, 0.7)';
}

export function createToggleWidget(
  targetWindow: Window,
  options: ToggleWidgetOptions
): ToggleWidgetController {
  let elements:
    | {
        container: HTMLDivElement;
        toggleBtn: HTMLButtonElement;
        collapseBtn: HTMLButtonElement;
        toggleWrapper: HTMLDivElement;
      }
    | null = null;
  let mounted = false;
  let isActive = false;
  let isCollapsed = false;
  let lastPosition = {
    left: '',
    top: '',
    right: '',
    bottom: ''
  };
  const defaultInnerGap = '6px';
  const defaultInnerPadding = '6px 8px';
  const dragState: DragState = {
    dragging: false,
    offsetX: 0,
    offsetY: 0,
    moved: false
  };

  const startDrag = (event: MouseEvent) => {
    if (!elements) return;
    // Don't drag if clicking buttons directly might be better handled by stopPropagation, 
    // but here we allow dragging from anywhere on the container.
    // However, if we click a button, we might want to prevent drag start or ensure click works?
    // Usually standard behavior: mousedown + mouseup without move = click. mousedown + move = drag.
    
    dragState.dragging = true;
    dragState.moved = false;
    const rect = elements.container.getBoundingClientRect();
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    
    // Switch to explicit coords for dragging
    elements.container.style.right = 'auto';
    elements.container.style.bottom = 'auto';
    elements.container.style.left = `${rect.left}px`;
    elements.container.style.top = `${rect.top}px`;
    elements.container.style.cursor = 'grabbing';
  };

  const onDrag = (event: MouseEvent) => {
    if (!elements || !dragState.dragging) return;
    dragState.moved = true;
    const nextLeft = event.clientX - dragState.offsetX;
    const nextTop = event.clientY - dragState.offsetY;
    const maxLeft = targetWindow.innerWidth - elements.container.offsetWidth;
    const maxTop = targetWindow.innerHeight - elements.container.offsetHeight;
    const clampedLeft = Math.max(0, Math.min(maxLeft, nextLeft));
    const clampedTop = Math.max(0, Math.min(maxTop, nextTop));
    elements.container.style.left = `${clampedLeft}px`;
    elements.container.style.top = `${clampedTop}px`;
  };

  const endDrag = () => {
    if (!elements) return;
    dragState.dragging = false;
    elements.container.style.cursor = 'grab';
  };

  const toggleCollapse = () => {
    if (!elements) return;
    const { container, toggleWrapper, collapseBtn } = elements;
    const inner = container.firstElementChild as HTMLDivElement | null;
    const svg = collapseBtn.querySelector('svg') as SVGElement | null;

    if (!isCollapsed) {
      const rect = container.getBoundingClientRect();
      lastPosition = {
        left: container.style.left,
        top: container.style.top,
        right: container.style.right,
        bottom: container.style.bottom
      };
      const stickLeft = rect.left + rect.width / 2 < targetWindow.innerWidth / 2;
      container.style.top = `${rect.top}px`;
      if (stickLeft) {
        container.style.left = '0px';
        container.style.right = 'auto';
      } else {
        container.style.left = 'auto';
        container.style.right = '0px';
      }
      container.style.bottom = 'auto';
      container.style.transform = 'scale(0.8)';
      container.style.padding = '0';
      toggleWrapper.style.maxWidth = '0px';
      toggleWrapper.style.opacity = '0';
      toggleWrapper.style.pointerEvents = 'none';
      if (inner) {
        inner.style.gap = '0';
        inner.style.padding = '6px';
      }
      if (svg) svg.style.transform = 'rotate(0deg)';
      isCollapsed = true;
    } else {
      container.style.left = lastPosition.left;
      container.style.top = lastPosition.top;
      container.style.right = lastPosition.right;
      container.style.bottom = lastPosition.bottom;
      container.style.transform = 'scale(1)';
      container.style.padding = '';
      toggleWrapper.style.maxWidth = '200px';
      toggleWrapper.style.opacity = '1';
      toggleWrapper.style.pointerEvents = 'auto';
      if (inner) {
        inner.style.gap = defaultInnerGap;
        inner.style.padding = defaultInnerPadding;
      }
      if (svg) svg.style.transform = 'rotate(180deg)';
      isCollapsed = false;
    }
  };

  return {
    mount() {
      if (mounted) return;
      mounted = true;
      elements = createToolbar(targetWindow);
      if (!elements) return;

      setButtonState(elements.toggleBtn, isActive);

      // Drag listeners on the container
      elements.container.addEventListener('mousedown', startDrag);
      
      // Toggle logic
      elements.toggleBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent affecting container?
        if (dragState.moved) return; // Prevent toggle if it was a drag
        
        isActive = !isActive;
        setButtonState(elements!.toggleBtn, isActive);
        options.onToggle(isActive);
      });

      // Collapse logic (Placeholder)
      elements.collapseBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (dragState.moved) return;
        toggleCollapse();
      });

      targetWindow.addEventListener('mousemove', onDrag);
      targetWindow.addEventListener('mouseup', endDrag);
      targetWindow.document.body.appendChild(elements.container);
    },
    unmount() {
      if (!mounted || !elements) return;
      mounted = false;
      elements.container.removeEventListener('mousedown', startDrag);
      elements.container.remove();
      elements = null;
      targetWindow.removeEventListener('mousemove', onDrag);
      targetWindow.removeEventListener('mouseup', endDrag);
    },
    setActive(active: boolean) {
      isActive = active;
      if (!elements) return;
      setButtonState(elements.toggleBtn, active);
    }
  };
}
