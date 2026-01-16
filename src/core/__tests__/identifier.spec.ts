import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { identifyComponent, extractMetadata } from '../identifier'

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
      count: 0
    }
  },
  setup() {
    return () => h('div', { class: 'target' }, 'Hello')
  }
})

describe('Component Identifier', () => {
  it('should identify a component from a DOM element', () => {
    const wrapper = mount(TestComponent)
    const el = wrapper.find('.target').element as HTMLElement
    
    const instance = identifyComponent(el)
    expect(instance).toBeDefined()
  })

  it('should extract metadata from a component instance', () => {
    const wrapper = mount(TestComponent, {
      props: {
        label: 'Click Me'
      }
    })
    const el = wrapper.find('.target').element as HTMLElement
    
    const instance = identifyComponent(el)
    const metadata = extractMetadata(instance)
    
    expect(metadata).toMatchObject({
      name: 'TestComponent',
      file: '/abs/path/to/TestComponent.vue',
      props: {
        label: 'Click Me'
      },
      data: {
        count: 0
      }
    })
  })

  it('includes vnode and location data when available', () => {
    const instance = {
      type: {
        name: 'MockComponent',
        __file: '/abs/path/to/MockComponent.vue'
      },
      vnode: {
        loc: {
          start: {
            line: 12,
            column: 8
          }
        }
      }
    }

    const metadata = extractMetadata(instance)

    expect(metadata).toMatchObject({
      name: 'MockComponent',
      file: '/abs/path/to/MockComponent.vue',
      line: 12,
      column: 8,
      vnode: instance.vnode
    })
  })

  it('falls back to parent metadata when file is missing', () => {
    const parent = {
      type: {
        name: 'ParentComponent',
        __file: '/abs/path/to/ParentComponent.vue',
        __line: 5,
        __column: 2
      },
      vnode: {
        loc: {
          start: {
            line: 5,
            column: 2
          }
        }
      }
    }
    const child = {
      type: {
        name: 'ChildComponent'
      },
      parent
    }

    const metadata = extractMetadata(child)

    expect(metadata).toMatchObject({
      name: 'ParentComponent',
      file: '/abs/path/to/ParentComponent.vue',
      line: 5,
      column: 2
    })
  })
})
