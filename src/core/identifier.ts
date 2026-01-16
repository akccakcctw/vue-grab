export function identifyComponent(el: HTMLElement | null): any {
  let curr = el;
  while (curr) {
    // Vue 3 stores the internal component instance on the DOM element
    // under specific keys depending on the version/environment.
    const instance = (curr as any).__vueParentComponent;
    if (instance) {
      return instance;
    }
    curr = curr.parentElement;
  }
  return null;
}

export function extractMetadata(instance: any) {
  if (!instance) return null;

  const type = instance.type || {};
  
  return {
    name: type.name || type.__name || 'AnonymousComponent',
    file: type.__file || 'unknown'
  };
}
