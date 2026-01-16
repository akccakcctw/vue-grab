# vue-grab

Developer-only bridge for inspecting Vue/Nuxt component context from the DOM.

## Install

```bash
pnpm add -D vue-grab
```

## Vue Usage

```ts
import { createApp } from 'vue'
import VueGrab from 'vue-grab'

const app = createApp(App)

if (process.env.NODE_ENV === 'development') {
  app.use(VueGrab, {
    overlayStyle: {
      border: '2px dashed #111'
    },
    onCopy(payload) {
      console.log('vue-grab payload', payload)
    }
  })
}

app.mount('#app')
```

## Nuxt Usage

```ts
export default defineNuxtConfig({
  modules: ['vue-grab'],
  vueGrab: {
    enabled: true,
    overlayStyle: {
      border: '2px dashed #111'
    }
  }
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

## MCP Example

```js
const info = window.__VUE_GRAB__.grabFromSelector('.my-button');
console.log(JSON.stringify(info));
```
