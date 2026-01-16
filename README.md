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

Note: `pnpm link --global vue-grab` does not update your app's `package.json` by default.
If you want it recorded in dependencies, use one of the following in your app repo:

```bash
pnpm add -D link:vue-grab
# or
pnpm add -D link:/Users/rex.tsou/vbox/vue-grab
```

Then run your app and verify `window.__VUE_GRAB__` in the browser console.

Cleanup when finished:

```bash
# In your app repo
pnpm unlink --global vue-grab
```

Manual verification checklist:
- Hover highlights appear when `activate()` is called.
- Clicking copies metadata (or triggers `onCopy` if configured).
- `grabFromSelector` returns component info for a known element.
