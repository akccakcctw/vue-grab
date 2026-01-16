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
    },
    copyOnClick: true
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
    },
    copyOnClick: true
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

## Development

For maintainers of this package (local dev + manual testing):

```bash
pnpm install
pnpm test
```

To test in a real app, link this package into a separate Vue/Nuxt project:

```bash
# In this repo
pnpm link --global

# In your app repo
pnpm link --global vue-grab
```

Then run your app and verify `window.__VUE_GRAB__` in the browser console.
