import { describe, it, expect } from 'vitest'
import { createToggleWidget } from '../widget'

describe('Toggle widget', () => {
  it('can be dragged within the viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 300, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 200, configurable: true })

    const widget = createToggleWidget(window, {
      onToggle: () => {}
    })
    widget.mount()

    const button = document.querySelector(
      '[data-vue-grab-toggle="true"]'
    ) as HTMLButtonElement
    Object.defineProperty(button, 'offsetWidth', { value: 80, configurable: true })
    Object.defineProperty(button, 'offsetHeight', { value: 30, configurable: true })

    button.dispatchEvent(new MouseEvent('mousedown', { clientX: 290, clientY: 190 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 150 }))
    window.dispatchEvent(new MouseEvent('mouseup'))

    const left = Number.parseFloat(button.style.left)
    const top = Number.parseFloat(button.style.top)
    expect(left).toBeGreaterThanOrEqual(0)
    expect(top).toBeGreaterThanOrEqual(0)
  })
})
