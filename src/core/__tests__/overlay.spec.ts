import { describe, it, expect, vi, afterEach } from 'vitest'
import { createOverlayController } from '../overlay'

describe('Overlay controller', () => {
  afterEach(() => {
    const overlay = document.querySelector('[data-vue-grab-overlay="true"]')
    overlay?.remove()
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
})
