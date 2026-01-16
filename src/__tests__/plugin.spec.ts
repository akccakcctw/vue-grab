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
      grabFromSelector: vi.fn()
    })

    const plugin = createVueGrabPlugin({ enabled: true })
    plugin.install()

    expect(installSpy).toHaveBeenCalledTimes(1)
  })

  it('skips install when disabled', () => {
    const installSpy = vi.spyOn(api, 'installVueGrab')
    const plugin = createVueGrabPlugin({ enabled: false })
    plugin.install()
    expect(installSpy).not.toHaveBeenCalled()
  })
})
