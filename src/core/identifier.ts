export function identifyComponent(el: HTMLElement | null): any {
  let curr = el;
  while (curr) {
    // Vue 3 stores the internal component instance on the DOM element
    // under specific keys depending on the version/environment.
    const currAny = curr as any;
    const instance =
      currAny.__vueParentComponent ||
      currAny.__vnode?.component ||
      currAny.__vnode?.ctx ||
      currAny.__vue__;
    if (instance) return instance;
    curr = curr.parentElement;
  }
  return null;
}

export function extractMetadata(instance: any) {
  if (!instance) return null;

  const type = instance.type || instance.$options || {};
  const props = instance.props || instance.$props || {};
  const data =
    (instance.data && Object.keys(instance.data).length > 0
      ? instance.data
      : instance.setupState) ||
    instance.$data ||
    {};

  return {
    name: type.name || type.__name || 'AnonymousComponent',
    file: type.__file || 'unknown',
    props,
    data
  };
}
