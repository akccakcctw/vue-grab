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

  it('handles circular references in props safely', () => {
    const onAgentTask = vi.fn()
    const controller = createOverlayController(window, { 
      // @ts-expect-error - extending options for internal testing
      onAgentTask 
    })
    controller.start()

    const target = document.createElement('div')
    target.className = 'target'
    document.body.appendChild(target)
    
    // Create circular structure
    const circularProp: any = { name: 'circular' }
    circularProp.self = circularProp

    // Create a complex nested circular structure simulating a VNode loop
    const vnodeLike: any = { __v_isVNode: true, type: 'div', props: {} }
    vnodeLike.props.vnode = vnodeLike 

    // Mock Vue component metadata
    ;(target as any).__vueParentComponent = {
      type: {
        name: 'CircularComponent',
        __file: '/path/to/CircularComponent.vue'
      },
      props: {
        circle: circularProp,
        vnodeLoop: vnodeLike
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
    
    // Set prompt
    textarea.value = 'Fix circle'

    // Submit
    submitBtn.click()

    expect(onAgentTask).toHaveBeenCalledTimes(1)
    const payload = onAgentTask.mock.calls[0][0]
    
    // Check that we can stringify the payload without error
    expect(() => JSON.stringify(payload)).not.toThrow()
    
    // Verify circular handling
    expect(payload.props.circle.self).toBe('[Circular]')
    
    controller.stop()
  })

  it('freezes highlight when dialog is open', () => {
    const controller = createOverlayController(window)
    controller.start()

    const target1 = document.createElement('div')
    target1.className = 'target1'
    document.body.appendChild(target1)

    const target2 = document.createElement('div')
    target2.className = 'target2'
    document.body.appendChild(target2)
    
    // Mock getBoundingClientRect
    target1.getBoundingClientRect = () => ({ top: 10, left: 10, width: 10, height: 10 } as DOMRect)
    target2.getBoundingClientRect = () => ({ top: 20, left: 20, width: 20, height: 20 } as DOMRect)

    // Select target1
    Object.defineProperty(document, 'elementFromPoint', { value: vi.fn(() => target1), configurable: true })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))

    const overlay = document.querySelector('[data-vue-grab-overlay="true"]') as HTMLElement
    expect(overlay.style.top).toBe('10px')

    // Open dialog (Ctrl+X)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true }))
    
    // Hover over target2 (simulate mouse move)
    Object.defineProperty(document, 'elementFromPoint', { value: vi.fn(() => target2), configurable: true })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20 }))

    // Overlay should STILL be at target1
    expect(overlay.style.top).toBe('10px')
    
    // Close dialog
    const dialog = document.querySelector('[data-vue-grab-agent-dialog="true"]') as HTMLElement
    dialog.querySelectorAll('button')[0].click() // Cancel

    // Now hover over target2 should update overlay
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20 }))
    expect(overlay.style.top).toBe('20px')

    controller.stop()
  })

  it('submits on Ctrl+Enter', () => {
    const onAgentTask = vi.fn()
    const controller = createOverlayController(window, { 
      // @ts-expect-error - extending options for internal testing
      onAgentTask 
    })
    controller.start()

    const target = document.createElement('div')
    document.body.appendChild(target)
    Object.defineProperty(document, 'elementFromPoint', { value: vi.fn(() => target), configurable: true })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))

    // Open dialog
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true }))
    
    const dialog = document.querySelector('[data-vue-grab-agent-dialog="true"]') as HTMLElement
    const textarea = dialog.querySelector('textarea') as HTMLTextAreaElement
    
    textarea.value = 'Ctrl Enter Test'

    // Trigger Ctrl+Enter on textarea
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }))

    expect(onAgentTask).toHaveBeenCalledTimes(1)
    expect(onAgentTask.mock.calls[0][0].prompt).toBe('Ctrl Enter Test')

    controller.stop()
  })
})
