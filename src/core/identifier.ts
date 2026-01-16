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

  const resolveType = (start: any) => {
    let curr = start;
    while (curr) {
      const t = curr.type || curr.$options || curr.type?.__vccOpts || {};
      const file = t.__file || t.__vccOpts?.__file;
      if (file) {
        return { type: t, instance: curr };
      }
      curr = curr.parent;
    }
    return { type: start.type || start.$options || start.type?.__vccOpts || {}, instance: start };
  };

  const resolved = resolveType(instance);
  const type = resolved.type || {};
  const props = instance.props || instance.$props || {};
  const data =
    (instance.data && Object.keys(instance.data).length > 0
      ? instance.data
      : instance.setupState) ||
    instance.$data ||
    {};
  const vnode = instance.vnode || instance.$vnode;
  const loc =
    vnode?.loc?.start ||
    resolved.instance?.vnode?.loc?.start ||
    resolved.instance?.parent?.vnode?.loc?.start;

  const metadata: Record<string, any> = {
    name: type.name || type.__name || type.__vccOpts?.name || 'AnonymousComponent',
    file: type.__file || type.__vccOpts?.__file || 'unknown',
    props,
    data
  };

  if (typeof loc?.line === 'number') {
    metadata.line = loc.line;
  } else if (typeof type.__line === 'number') {
    metadata.line = type.__line;
  } else if (typeof type.line === 'number') {
    metadata.line = type.line;
  } else if (typeof type.__vccOpts?.__line === 'number') {
    metadata.line = type.__vccOpts.__line;
  }

  if (typeof loc?.column === 'number') {
    metadata.column = loc.column;
  } else if (typeof type.__column === 'number') {
    metadata.column = type.__column;
  } else if (typeof type.column === 'number') {
    metadata.column = type.column;
  } else if (typeof type.__vccOpts?.__column === 'number') {
    metadata.column = type.__vccOpts.__column;
  }

  if (vnode) {
    metadata.vnode = vnode;
  }

  return metadata;
}
