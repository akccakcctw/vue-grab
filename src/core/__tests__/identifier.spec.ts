import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { identifyComponent, extractMetadata } from '../identifier'

const TestComponent = defineComponent({
  name: 'TestComponent',
  __file: '/abs/path/to/TestComponent.vue',
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
    const wrapper = mount(TestComponent)
    const el = wrapper.find('.target').element as HTMLElement
    
    const instance = identifyComponent(el)
    const metadata = extractMetadata(instance)
    
    expect(metadata).toEqual({
      name: 'TestComponent',
      file: '/abs/path/to/TestComponent.vue'
    })
  })
})
