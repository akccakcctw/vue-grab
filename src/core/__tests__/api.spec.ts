import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createVueGrabAPI, installVueGrab } from '../api'

const TestComponent = defineComponent({
  name: 'TestComponent',
  __file: '/abs/path/to/TestComponent.vue',
  props: {
    label: {
      type: String,
      default: 'Default'
    }
  },
  data() {
    return {
      count: 1
    }
  },
  setup() {
    return () => h('div', { class: 'target' }, 'Hello')
  }
})

describe('VueGrab API', () => {
  afterEach(() => {
    delete (window as any).__VUE_GRAB__
  })

  it('tracks activation state', () => {
    const api = createVueGrabAPI(window)
    expect(api.isActive).toBe(false)
    api.activate()
    expect(api.isActive).toBe(true)
    api.deactivate()
    expect(api.isActive).toBe(false)
  })

  it('returns component info from selector', () => {
    const wrapper = mount(TestComponent, {
      attachTo: document.body,
      props: {
        label: 'Click Me'
      }
    })
    const api = createVueGrabAPI(window)
    const info = api.grabFromSelector('.target')

    expect(info).toEqual({
      name: 'TestComponent',
      file: '/abs/path/to/TestComponent.vue',
      props: {
        label: 'Click Me'
      },
      data: {
        count: 1
      },
      element: wrapper.find('.target').element
    })
    wrapper.unmount()
  })

  it('returns component info from coordinates', () => {
    const wrapper = mount(TestComponent)
    const el = wrapper.find('.target').element as HTMLElement
    const original = document.elementFromPoint
    Object.defineProperty(document, 'elementFromPoint', {
      value: vi.fn(() => el),
      configurable: true
    })

    const api = createVueGrabAPI(window)
    const info = api.grabAt(10, 20)

    expect(info?.element).toBe(el)
    if (original) {
      Object.defineProperty(document, 'elementFromPoint', {
        value: original,
        configurable: true
      })
    } else {
      delete (document as any).elementFromPoint
    }
    wrapper.unmount()
  })

  it('installs a single global instance', () => {
    const api1 = installVueGrab(window)
    const api2 = installVueGrab(window)
    expect(api1).toBe(api2)
  })
})
