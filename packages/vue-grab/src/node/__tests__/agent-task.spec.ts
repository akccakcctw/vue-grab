import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { writeAgentTask } from '../agent-task.js'

vi.mock('node:fs', () => ({
  default: {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
  }
}))

describe('Agent Task Writer', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('writes task to AI_TASK.md', async () => {
    const rootDir = '/mock/root'
    const task = {
      prompt: 'Fix this bug',
      file: '/mock/root/src/App.vue',
      line: 10,
      column: 5
    }

    const expectedPath = path.join(rootDir, '.vue-grab', 'AI_TASK.md')
    
    // Mock return values
    vi.mocked(fs.readFileSync).mockReturnValue('')

    await writeAgentTask(rootDir, task)

    expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(rootDir, '.vue-grab'), { recursive: true })
    expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expect.stringContaining('Fix this bug'), 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expect.stringContaining('/mock/root/src/App.vue'), 'utf-8')
  })
})
