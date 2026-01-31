import { describe, it, expect, vi, afterEach } from 'vitest'
import { createOverlayController } from '../overlay.js'

describe('Overlay agent integration', () => {
  afterEach(() => {
    const overlay = document.querySelector('[data-vue-grab-overlay="true"]')
    overlay?.remove()
    const dialog = document.querySelector('[data-vue-grab-agent-dialog="true"]')
    dialog?.remove()
    document.body.innerHTML = ''
  })

  it('opens agent prompt dialog on Ctrl+X', () => {
    const controller = createOverlayController(window)
    controller.start()

    // Simulate hovering over an element to set the "current" target
    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)
    
    // Mock elementFromPoint to return our target
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    // Trigger mousemove to update internal state of hovered element
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))

    // Trigger Ctrl+X
    document.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'x', 
      ctrlKey: true, 
      bubbles: true 
    }))

    const dialog = document.querySelector('[data-vue-grab-agent-dialog="true"]')
    expect(dialog).toBeTruthy()
    
    controller.stop()
  })

  it('does not open dialog on Ctrl+X if no element is selected', () => {
    const controller = createOverlayController(window)
    controller.start()

    // No element hovered

    // Trigger Ctrl+X
    document.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'x', 
      ctrlKey: true, 
      bubbles: true 
    }))

    const dialog = document.querySelector('[data-vue-grab-agent-dialog="true"]')
    expect(dialog).toBeFalsy()
    
    controller.stop()
  })

  it('submits task with metadata on button click', () => {
    const onAgentTask = vi.fn()
    const controller = createOverlayController(window, { 
      // @ts-expect-error - extending options for internal testing
      onAgentTask 
    })
    controller.start()

    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)
    
    // Mock Vue component metadata
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'TestComponent',
        __file: '/path/to/TestComponent.vue'
      },
      vnode: {
        loc: {
          start: { line: 10, column: 5 }
        }
      }
    }

    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => target),
      configurable: true
    })

    // Hover to select
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))

    // Open dialog
    document.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'x', 
      ctrlKey: true, 
      bubbles: true 
    }))

    const dialog = document.querySelector('[data-vue-grab-agent-dialog="true"]') as HTMLElement
    const textarea = dialog.querySelector('textarea') as HTMLTextAreaElement
    const submitBtn = dialog.querySelectorAll('button')[1] as HTMLButtonElement

    // Type prompt
    textarea.value = 'Change color to red'
    
    // Click submit
    submitBtn.click()

    expect(onAgentTask).toHaveBeenCalledTimes(1)
    const payload = onAgentTask.mock.calls[0][0]
    expect(payload.prompt).toBe('Change color to red')
    expect(payload.file).toBe('/path/to/TestComponent.vue')
    expect(payload.line).toBe(10)
    expect(payload.column).toBe(5)
    
    // Dialog should be closed
    expect(document.querySelector('[data-vue-grab-agent-dialog="true"]')).toBeFalsy()

    controller.stop()
  })
})
