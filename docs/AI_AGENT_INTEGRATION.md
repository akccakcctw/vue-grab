# AI Agent Integration Plan for vue-grab

This document outlines the roadmap for integrating AI agent capabilities into `vue-grab`, inspired by `EnderRomantice/vue-grab`. The goal is to bridge the browser's visual context with AI agents (like Cursor, Claude, or CLI agents) to streamline UI development.

## Strategy: "Agent Task Generator" (Plan A)

We will implement a flow where the browser captures user intent and context, transmits it to the local dev server, and generates a structured task file (e.g., `AI_TASK.md`) that an AI agent can execute.

### Phases

#### Phase 1: Frontend Intent Capture (Browser Side)
**Goal:** Allow users to select a component in the browser and input a prompt.

1.  **UI Trigger:** Implement a keyboard shortcut (default: `Ctrl + X`) available when `vue-grab` is active.
2.  **Prompt Dialog:** Show a UI overlay asking "What would you like to change about this component?".
3.  **Context Collection:** Gather detailed metadata:
    *   File path, line, column (existing).
    *   Component Name.
    *   Current Props/Data (if accessible).
    *   User's Prompt.

#### Phase 2: Browser-Server Bridge (Communication)
**Goal:** Send the captured data from the browser to the local file system.

1.  **Vite/Nuxt Middleware:** Create a dev server endpoint (e.g., `/__vue-grab/agent-task`).
2.  **Client Dispatch:** Front-end sends the JSON payload to this endpoint via `fetch` or Vite HMR channel.
3.  **File Generation:** The server receives the payload and writes/updates a standardized task file (e.g., `.vue-grab/AI_TASK.md` or `current_task.json`) in the project root.

#### Phase 3: Agent Execution (Workflow)
**Goal:** AI Agents consume the task file.

1.  **Task File Structure:** Define a clear format for `AI_TASK.md` that includes:
    *   **Instruction:** The user's prompt.
    *   **File Context:** The absolute path to the file to be modified.
    *   **Snippet:** The specific code block (derived from line/column info).
2.  **Execution:** The user can then instruct their AI agent (e.g., "Fix the issue described in .vue-grab/AI_TASK.md").

---

## Development Process (TDD)

We will follow a Test-Driven Development approach.

### Phase 1: Frontend Implementation Steps

1.  **Test:** Create tests for `Overlay` ensuring it listens for the defined shortcut key.
2.  **Implement:** Add the event listener to `packages/vue-grab/src/core/overlay.ts`.
3.  **Test:** Create tests for the "Prompt Dialog" state (open/closed).
4.  **Implement:** Add the UI logic for the prompt dialog (HTML/CSS injection).
5.  **Test:** Verify the data collection logic (mocking the Vue component context).
6.  **Implement:** Wire up the context gathering.

*(Subsequent phases will follow a similar pattern)*
