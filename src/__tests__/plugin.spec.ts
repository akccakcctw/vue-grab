import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as api from '../core/api'
import { createVueGrabPlugin } from '../plugin'

describe('Vue plugin', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    ;(globalThis as any).window = originalWindow || ({} as Window)
  })

  afterEach(() => {
    ;(globalThis as any).window = originalWindow
    vi.restoreAllMocks()
  })

  it('installs when enabled', () => {
    const installSpy = vi.spyOn(api, 'installVueGrab').mockReturnValue({
      activate: vi.fn(),
      deactivate: vi.fn(),
      isActive: false,
      grabAt: vi.fn(),
      grabFromSelector: vi.fn(),
      grabFromElement: vi.fn(),
      highlight: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      getComponentDetails: vi.fn(),
      setOverlayStyle: vi.fn()
    })
    const onCopy = vi.fn()

    const plugin = createVueGrabPlugin({
      enabled: true,
      overlayStyle: {
        border: '1px solid red'
      },
      onCopy,
      copyOnClick: false
    })
    plugin.install()

    expect(installSpy).toHaveBeenCalledTimes(1)
    expect(installSpy).toHaveBeenCalledWith(window, {
      overlayStyle: {
        border: '1px solid red'
      },
      onCopy,
      copyOnClick: false
    })
  })

  it('skips install when disabled', () => {
    const installSpy = vi.spyOn(api, 'installVueGrab')
    const plugin = createVueGrabPlugin({ enabled: false })
    plugin.install()
    expect(installSpy).not.toHaveBeenCalled()
  })
})
