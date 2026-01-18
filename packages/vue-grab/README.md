# @akccakcctw/vue-grab

Developer-only bridge for inspecting Vue/Nuxt component context from the DOM.

[![npm](https://img.shields.io/npm/v/@akccakcctw/vue-grab)](https://www.npmjs.com/package/@akccakcctw/vue-grab)
NPM package: https://www.npmjs.com/package/@akccakcctw/vue-grab

## Install

```bash
pnpm add -D @akccakcctw/vue-grab
```

## Vue Usage

```ts
import { createApp } from 'vue'
import { createVueGrabPlugin } from '@akccakcctw/vue-grab'

const app = createApp(App)

// Use import.meta.env.DEV for Vite, or process.env.NODE_ENV === 'development' for Webpack
if (import.meta.env.DEV) {
  app.use(createVueGrabPlugin({
    overlayStyle: {
      border: '2px dashed #111'
    },
    onCopy(payload) {
      console.log('vue-grab payload', payload)
    },
    copyOnClick: true
  }))
}

app.mount('#app')
```

## Nuxt Usage

```ts
export default defineNuxtConfig({
  modules: ['@akccakcctw/vue-grab'],
  vueGrab: {
    enabled: true,
    overlayStyle: {
      border: '2px dashed #111'
    },
    copyOnClick: true
  }
})
```

## Vite Line/Column Support

Add the Vite plugin to inject `__file`, `__line`, and `__column` metadata into SFCs.
It also annotates template DOM nodes with their original line/column so element grabs map to the template line numbers.

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVueGrabVitePlugin } from '@akccakcctw/vue-grab/vite'

export default defineConfig({
  plugins: [vue(), createVueGrabVitePlugin()]
})
```

## Browser API

When active, `window.__VUE_GRAB__` exposes:

- `activate()` / `deactivate()`
- `grabAt(x, y)`
- `grabFromSelector(selector)`
- `grabFromElement(element)`
- `highlight(selector)`
- `setOverlayStyle(style)`
- Aliases: `enable()` / `disable()` / `getComponentDetails(selectorOrElement)`

A floating toggle button is injected in dev to switch grab mode on/off. Hover shows file:line:column.

## MCP Example

```js
const info = window.__VUE_GRAB__.grabFromSelector('.my-button');
console.log(JSON.stringify(info));
```

For the full documentation, see https://github.com/akccakcctw/vue-grab.
