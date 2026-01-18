import { describe, it, expect } from 'vitest'
import { createVueGrabVitePlugin } from '../vite.js'

function createVueConfig() {
  const vuePlugin = {
    name: 'vite:vue',
    api: {
      options: {}
    }
  }

  return {
    command: 'serve',
    root: '/root',
    plugins: [vuePlugin]
  } as any
}

describe('Vite plugin', () => {
  it('injects a template node transform for DOM loc attributes', () => {
    const plugin = createVueGrabVitePlugin()
    const config = createVueConfig()

    plugin.configResolved?.(config)

    const compilerOptions = config.plugins[0].api.options.template.compilerOptions
    const nodeTransforms = compilerOptions.nodeTransforms
    const transform = nodeTransforms.find((node: any) => node?.__vueGrabLocTransform)
    expect(transform).toBeTypeOf('function')

    const node = {
      type: 1,
      tagType: 0,
      props: [],
      loc: {
        start: {
          line: 4,
          column: 7
        }
      }
    }

    transform(node)

    expect(node.props).toContainEqual(
      expect.objectContaining({
        name: 'data-vue-grab-loc',
        value: expect.objectContaining({
          content: '4:7'
        })
      })
    )
  })

  it('skips component nodes', () => {
    const plugin = createVueGrabVitePlugin()
    const config = createVueConfig()

    plugin.configResolved?.(config)

    const compilerOptions = config.plugins[0].api.options.template.compilerOptions
    const nodeTransforms = compilerOptions.nodeTransforms
    const transform = nodeTransforms.find((node: any) => node?.__vueGrabLocTransform)
    expect(transform).toBeTypeOf('function')

    const node = {
      type: 1,
      tagType: 1,
      props: [],
      loc: {
        start: {
          line: 4,
          column: 7
        }
      }
    }

    transform(node)

    expect(node.props).toHaveLength(0)
  })
})
