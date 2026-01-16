# Software Design Document: vue-grab

## 1. Introduction

`vue-grab` is a development tool designed to bridge the gap between Vue.js applications and AI coding agents. Inspired by `react-grab`, it allows developers (and AI agents) to inspect the UI of a running Vue application and instantly retrieve context about the underlying components. This context includes the component name, file path, current props, and state.

This tool is specifically designed to work with `chrome-devtools-mcp` to facilitate seamless interaction for AI agents.

## 2. Goals & Requirements

### 2.1 Functional Requirements
*   **Component Inspection:** Ability to identify the Vue component associated with a specific DOM element.
*   **Context Extraction:** Retrieve component metadata:
    *   Component Name
    *   Source File Path (absolute path for direct IDE opening/reading)
    *   Line/Column numbers (if available)
    *   Current Props
    *   Current Data/State
    *   VNode (if available)
*   **Visual Feedback:** Highlight components on hover when "Grab Mode" is active.
*   **Clipboard Integration:** Copy component details to clipboard on click.
*   **Framework Support:**
    *   Vue 3 (Composition & Options API)
    *   Vue 2 (Legacy support if feasible, primarily focusing on Vue 3)
    *   Nuxt 3 (via Nuxt Module/Plugin)
*   **MCP Integration:** Expose a global API accessible by `chrome-devtools-mcp` (via Puppeteer/Console) to allow AI agents to programmatically "grab" or query the page.

### 2.2 Non-Functional Requirements
*   **Performance:** Minimal impact on the application performance when inactive.
*   **Dev-Only:** Should only be active in development mode.
*   **Zero-Config (Ideal):** Should work with standard Vite/Webpack setups out of the box.

## 3. Architecture

### 3.1 High-Level Overview
`vue-grab` consists of a client-side library that injects itself into the Vue application. It listens for user interactions (hover/click) and leverages Vue's internal properties on DOM elements to traverse the component tree.

### 3.2 Component Identification Strategy
Vue applications attach internal instance data to DOM elements.
*   **Vue 3:** Look for properties starting with `__vueParentComponent` or `__vnode` on the DOM element.
*   **Vue 2:** Look for `__vue__` on the DOM element.

### 3.3 Source Code Mapping
Modern build tools (Vite/Webpack) inject location metadata into components during development.
*   **`__file`**: The absolute file path of the SFC.
*   **`__name`**: The component name.

We will traverse the fiber/component tree to find the nearest component boundary for a given DOM node.

### 3.4 MCP Integration
To allow `chrome-devtools-mcp` (which uses Puppeteer) to interact with `vue-grab`, we will expose a global object on the window: `window.__VUE_GRAB__`.

**Contract:**
*   `window.__VUE_GRAB__.enable()`: Turn on inspection mode.
*   `window.__VUE_GRAB__.disable()`: Turn off inspection mode.
*   `window.__VUE_GRAB__.getComponentDetails(selectorOrElement)`: Return a JSON object with component info.
*   `window.__VUE_GRAB__.highlight(selector)`: Programmatically highlight an element.

## 4. API Design

### 4.1 Global API (Window)
```typescript
interface VueGrabAPI {
  // Activation
  activate(): void;
  deactivate(): void;
  isActive: boolean;

  // Direct Query (for AI Agents)
  grabAt(x: number, y: number): ComponentInfo | null;
  grabFromSelector(selector: string): ComponentInfo | null;
  highlight(selector: string): void;
}
```

### 4.2 Component Info Structure
```typescript
interface ComponentInfo {
  name: string;
  file: string; // Absolute path
  props: Record<string, any>;
  data: Record<string, any>;
  element: HTMLElement; // Reference to the root DOM element
  line?: number;
  column?: number;
  vnode?: any;
}
```

## 5. Integration Modules

### 5.1 Vue 3 Plugin
A simple Vue plugin `VueGrab` that installs the global handler and sets up the event listeners.

```javascript
import { createApp } from 'vue'
import VueGrab from 'vue-grab'

const app = createApp(App)
if (process.env.NODE_ENV === 'development') {
  app.use(VueGrab)
}
app.mount('#app')
```

### 5.2 Nuxt Module
A Nuxt module that automatically injects the plugin in development mode.
Configuration key: `vueGrab` (example below).

```ts
export default defineNuxtConfig({
  modules: ['vue-grab'],
  vueGrab: {
    enabled: true
  }
})
```

## 6. Development Plan (TDD)

We will follow Test-Driven Development.

1.  **Phase 1: Core Logic (Unit Tests)**
    *   Create a dummy Vue 3 component tree in JSDOM environment.
    *   Test `identifyComponent(domNode)`: Verify it finds the correct component instance.
    *   Test `extractMetadata(componentInstance)`: Verify it extracts file path and name.

2.  **Phase 2: Interaction (E2E/Integration)**
    *   Implement the overlay/highlight logic.
    *   Implement the click-to-copy logic.

3.  **Phase 3: Integration**
    *   Build the Vue Plugin.
    *   Build the Nuxt Module.
    *   Verify `window.__VUE_GRAB__` API.

4.  **Phase 4: MCP Verification**
    *   Simulate MCP calls to ensure the API returns data in the expected format.
