import { describe, it, expect, vi, afterEach } from 'vitest'
import { createOverlayController } from '../overlay'

describe('Overlay controller', () => {
  afterEach(() => {
    const overlay = document.querySelector('[data-vue-grab-overlay="true"]')
    overlay?.remove()
    const tooltip = document.querySelector('[data-vue-grab-tooltip="true"]')
    tooltip?.remove()
    document.body.innerHTML = ''
  })

  it('adds and removes overlay element', () => {
    const controller = createOverlayController(window)
    controller.start()
    expect(document.querySelector('[data-vue-grab-overlay="true"]')).toBeTruthy()
    controller.stop()
    expect(document.querySelector('[data-vue-grab-overlay="true"]')).toBeFalsy()
  })

  it('applies custom overlay styles', () => {
    const controller = createOverlayController(window, {
      overlayStyle: {
        border: '3px solid rgb(0, 0, 0)'
      }
    })
    controller.start()
    const overlay = document.querySelector(
      '[data-vue-grab-overlay="true"]'
    ) as HTMLDivElement
    expect(overlay.style.border).toBe('3px solid rgb(0, 0, 0)')
    controller.stop()
  })

  it('updates overlay styles at runtime', () => {
    const controller = createOverlayController(window)
    controller.start()
    controller.setStyle({
      border: '1px dotted rgb(10, 20, 30)'
    })
    const overlay = document.querySelector(
      '[data-vue-grab-overlay="true"]'
    ) as HTMLDivElement
    expect(overlay.style.border).toBe('1px dotted rgb(10, 20, 30)')
    controller.stop()
  })

  it('updates overlay position on mouse move', () => {
    const target = document.createElement('div')
    target.className = 'target'
    target.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 20,
        width: 100,
        height: 50
      }) as DOMRect
    document.body.appendChild(target)
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    const controller = createOverlayController(window)
    controller.start()
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))

    const overlay = document.querySelector(
      '[data-vue-grab-overlay="true"]'
    ) as HTMLDivElement
    expect(overlay.style.top).toBe('10px')
    expect(overlay.style.left).toBe('20px')
    expect(overlay.style.width).toBe('100px')
    expect(overlay.style.height).toBe('50px')
    controller.stop()
  })

  it('shows file location tooltip on hover', () => {
    const target = document.createElement('div')
    target.className = 'target'
    target.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 20,
        width: 100,
        height: 50,
        bottom: 60
      }) as DOMRect
    document.body.appendChild(target)
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'TooltipComponent',
        __file: '/abs/path/src/components/Tooltip.vue'
      },
      vnode: {
        loc: {
          start: {
            line: 51,
            column: 3
          }
        }
      }
    }
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    const controller = createOverlayController(window)
    controller.start()
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))

    const tooltip = document.querySelector(
      '[data-vue-grab-tooltip="true"]'
    ) as HTMLDivElement
    expect(tooltip.textContent).toBe('components/Tooltip.vue:51:3')
    controller.stop()
  })

  it('uses rootDir for relative paths', () => {
    const target = document.createElement('div')
    target.className = 'target'
    target.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 20,
        width: 100,
        height: 50,
        bottom: 60
      }) as DOMRect
    document.body.appendChild(target)
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'TooltipComponent',
        __file: '/root/app/components/Tooltip.vue'
      },
      vnode: {
        loc: {
          start: {
            line: 9,
            column: 4
          }
        }
      }
    }
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    const controller = createOverlayController(window, {
      rootDir: '/root/app'
    })
    controller.start()
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))

    const tooltip = document.querySelector(
      '[data-vue-grab-tooltip="true"]'
    ) as HTMLDivElement
    expect(tooltip.textContent).toBe('components/Tooltip.vue:9:4')
    controller.stop()
  })

  it('omits line and column when missing', () => {
    const target = document.createElement('div')
    target.className = 'target'
    target.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 20,
        width: 100,
        height: 50,
        bottom: 60
      }) as DOMRect
    document.body.appendChild(target)
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'TooltipComponent',
        __file: '/abs/path/src/components/Tooltip.vue'
      }
    }
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    const controller = createOverlayController(window)
    controller.start()
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))

    const tooltip = document.querySelector(
      '[data-vue-grab-tooltip="true"]'
    ) as HTMLDivElement
    expect(tooltip.textContent).toBe('components/Tooltip.vue')
    controller.stop()
  })

  it('clamps tooltip position within viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 120, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 80, configurable: true })
    const target = document.createElement('div')
    target.className = 'target'
    target.getBoundingClientRect = () =>
      ({
        top: 2,
        left: 110,
        width: 50,
        height: 20,
        bottom: 22
      }) as DOMRect
    document.body.appendChild(target)
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'TooltipComponent',
        __file: '/abs/path/src/components/Tooltip.vue'
      }
    }
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    const controller = createOverlayController(window)
    controller.start()
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))

    const tooltip = document.querySelector(
      '[data-vue-grab-tooltip="true"]'
    ) as HTMLDivElement
    const left = Number.parseFloat(tooltip.style.left)
    const top = Number.parseFloat(tooltip.style.top)
    expect(left).toBeGreaterThanOrEqual(0)
    expect(top).toBeGreaterThanOrEqual(0)
    controller.stop()
  })

  it('copies metadata on click', async () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const controller = createOverlayController(window)
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(writeText).toHaveBeenCalledTimes(1)
    const payload = writeText.mock.calls[0][0] as string
    expect(payload).toContain('{')
    controller.stop()
  })

  it('uses onCopy handler when provided', () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    const onCopy = vi.fn()
    const controller = createOverlayController(window, { onCopy })
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'TestComponent',
        __file: '/abs/path/to/TestComponent.vue'
      }
    }
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onCopy).toHaveBeenCalledTimes(1)
    controller.stop()
  })

  it('skips copy on click when disabled', () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const controller = createOverlayController(window, {
      copyOnClick: false
    })
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(writeText).not.toHaveBeenCalled()
    controller.stop()
  })

  it('avoids circular metadata errors on copy', () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    const instance: any = {
      type: {
        name: 'CycleComponent',
        __file: '/abs/path/to/CycleComponent.vue'
      },
      vnode: {}
    }
    instance.vnode.component = instance
    ;(target as any).__vueParentComponent = instance

    const onCopy = vi.fn()
    const controller = createOverlayController(window, { onCopy })
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onCopy).toHaveBeenCalledTimes(1)
    controller.stop()
  })

  it('handles window references in metadata', () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    ;(target as any).__vueParentComponent = {
      type: {
        name: 'WindowComponent',
        __file: '/abs/path/to/WindowComponent.vue'
      },
      props: {
        win: window
      }
    }

    const onCopy = vi.fn()
    const controller = createOverlayController(window, { onCopy })
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onCopy).toHaveBeenCalledTimes(1)
    controller.stop()
  })

  it('limits depth and size to avoid huge payloads', () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    const large: any = {}
    let curr = large
    for (let i = 0; i < 20; i += 1) {
      curr.next = { value: i }
      curr = curr.next
    }

    ;(target as any).__vueParentComponent = {
      type: {
        name: 'LargeComponent',
        __file: '/abs/path/to/LargeComponent.vue'
      },
      props: {
        data: large
      }
    }

    const onCopy = vi.fn()
    const controller = createOverlayController(window, { onCopy })
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const payload = onCopy.mock.calls[0][0] as string
    expect(payload).toContain('[DepthLimit]')
    controller.stop()
  })

  it('serializes vnode without component proxy', () => {
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)

    const vnode = {
      __v_isVNode: true,
      type: 'div',
      component: { $el: target },
      props: { id: 'test' }
    }

    ;(target as any).__vueParentComponent = {
      type: {
        name: 'VNodeComponent',
        __file: '/abs/path/to/VNodeComponent.vue'
      },
      vnode
    }

    const onCopy = vi.fn()
    const controller = createOverlayController(window, { onCopy })
    controller.start()
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const payload = onCopy.mock.calls[0][0] as string
    expect(payload).toContain('"props"')
    controller.stop()
  })
})
