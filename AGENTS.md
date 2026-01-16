# AI Agent Interaction Guide: vue-grab

This document provides instructions for AI agents on how to utilize `vue-grab` to inspect and modify Vue/Nuxt applications.

## 1. Overview for Agents

`vue-grab` exposes a global bridge in the browser's `window` object that allows you to query the internal structure of a Vue application directly from the DOM. This is particularly useful when combined with `chrome-devtools-mcp`.

## 2. Global API Bridge

When `vue-grab` is active in a development environment, it exposes `window.__VUE_GRAB__`.

### Methods

| Method | Description | Parameters | Return Type |
| :--- | :--- | :--- | :--- |
| `grabAt(x, y)` | Get component info at viewport coordinates. | `x: number, y: number` | `ComponentInfo \| null` |
| `grabFromSelector(selector)` | Get component info from a CSS selector. | `selector: string` | `ComponentInfo \| null` |
| `activate()` | Enable visual inspection mode (highlights on hover). | N/A | `void` |
| `deactivate()` | Disable visual inspection mode. | N/A | `void` |

### Data Structures

#### `ComponentInfo`
```json
{
  "name": "MyButton",
  "file": "/Users/user/project/src/components/MyButton.vue",
  "props": { "label": "Click Me" },
  "data": { "count": 0 },
  "vnode": { ... } // Internal Vue vnode structure
}
```

## 3. Interaction Patterns with MCP

### Scenario: Find source code for a button
1.  **Step 1:** Use MCP's `inspect_element` or `get_dom_tree` to find the coordinates or selector of the button.
2.  **Step 2:** Execute a JS snippet via MCP to call `vue-grab`:
    ```javascript
    const info = window.__VUE_GRAB__.grabFromSelector('.my-button');
    console.log(JSON.stringify(info));
    ```
3.  **Step 3:** Use the returned `file` path to read the source code using your file system tools.

### Scenario: Debugging State
1.  **Step 1:** Query the component:
    ```javascript
    const info = window.__VUE_GRAB__.grabAt(100, 250);
    ```
2.  **Step 2:** Analyze `props` and `data` to understand why the UI is rendering a certain way.

## 4. Nuxt Support
In Nuxt applications, `vue-grab` is automatically injected via a Nuxt Module. The API remains identical.

## 5. Development Tips for Agents
*   **Absolute Paths:** `vue-grab` provides absolute file paths in development mode, allowing you to immediately open the correct file without guessing.
*   **Anonymous Components:** If a component doesn't have a name, `vue-grab` defaults to `AnonymousComponent`. Try to look at the `file` property to identify it.
*   **Package Manager:** Use `pnpm` instead of `npm` for all package scripts and installs.
