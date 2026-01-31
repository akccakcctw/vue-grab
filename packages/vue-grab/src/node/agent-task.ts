import fs from 'node:fs';
import path from 'node:path';

export interface AgentTask {
  prompt: string;
  file: string;
  line?: number;
  column?: number;
}

export async function writeAgentTask(rootDir: string, task: AgentTask) {
  const dir = path.join(rootDir, '.vue-grab');
  const filePath = path.join(dir, 'AI_TASK.md');

  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore
  }

  let sourceSnippet = '(File content not available)';
  try {
    const content = fs.readFileSync(task.file, 'utf-8');
    const lines = content.split('\n');
    if (task.line) {
        // Get some context lines
        const start = Math.max(0, task.line - 5);
        const end = Math.min(lines.length, task.line + 5);
        sourceSnippet = lines.slice(start, end).join('\n');
    } else {
        sourceSnippet = content;
    }
  } catch (e) {
    // ignore
  }

  const relativeFile = task.file.replace(rootDir, '').replace(/^\/+/, '');

  const content = `# Agent Task

## Instruction
${task.prompt}

## Context
- **File**: ${task.file}
- **Location**: Line ${task.line ?? '?'}, Column ${task.column ?? '?'}

## Snippet
\
\
vue:${relativeFile}:${task.line ?? 1}
${sourceSnippet}
\
\
`;

  fs.writeFileSync(filePath, content, 'utf-8');
}
