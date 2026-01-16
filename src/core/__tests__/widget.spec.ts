import { describe, it, expect, afterEach } from 'vitest'
import { createToggleWidget } from '../widget'

describe('Toggle widget', () => {
  afterEach(() => {
    document.querySelectorAll('[data-vue-grab-toolbar]').forEach((el) => el.remove())
  })

  it('can be dragged within the viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 300, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 200, configurable: true })

    const widget = createToggleWidget(window, {
      onToggle: () => {}
    })
    widget.mount()

    const container = document.querySelector(
      '[data-vue-grab-toolbar]'
    ) as HTMLDivElement
    expect(container).toBeTruthy()

    Object.defineProperty(container, 'offsetWidth', { value: 80, configurable: true })
    Object.defineProperty(container, 'offsetHeight', { value: 30, configurable: true })

    container.dispatchEvent(new MouseEvent('mousedown', { clientX: 290, clientY: 190 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 150 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    const left = Number.parseFloat(container.style.left)
    const top = Number.parseFloat(container.style.top)
    expect(left).toBeGreaterThanOrEqual(0)
    expect(top).toBeGreaterThanOrEqual(0)
    // Should be near the mouse position (offset preserved)
    // Initial: right 16, bottom 16. but logic sets left/top on drag start.
  })

  it('collapses and expands the toolbar', () => {
    const widget = createToggleWidget(window, {
      onToggle: () => {}
    })
    widget.mount()

    const collapse = document.querySelector(
      '[data-vue-grab-collapse]'
    ) as HTMLButtonElement
    const toggleWrapper = document.querySelector(
      '[data-vue-grab-toggle]'
    )?.parentElement as HTMLDivElement

    collapse.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(toggleWrapper.style.maxWidth).toBe('0px')

    collapse.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(toggleWrapper.style.maxWidth).toBe('200px')
  })
})
