# vue-grab

Developer-only bridge for inspecting Vue/Nuxt component context from the DOM.

## Install

```bash
pnpm add -D @akccakcctw/vue-grab
```

## Vue Usage

```ts
import { createApp } from 'vue'
import VueGrab from 'vue-grab'

const app = createApp(App)

// Use import.meta.env.DEV for Vite, or process.env.NODE_ENV === 'development' for Webpack
if (import.meta.env.DEV) {
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

A floating toggle button is injected in dev to switch grab mode on/off. Hover shows file:line:column.

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
pnpm link --global @akccakcctw/vue-grab
```

Note: `pnpm link --global @akccakcctw/vue-grab` does not update your app's `package.json` by default.
If you want it recorded in dependencies, use one of the following in your app repo:

```bash
pnpm add -D link:/absolute/path/to/vue-grab
# or
pnpm add -D link:../vue-grab
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

## Release & Publish (GitHub Actions)

Publishing is automated by release-please and GitHub Actions:

1) Merge changes into `main`.
2) `release-please` opens a release PR that updates `CHANGELOG.md` and versions.
3) Merge the release PR; the workflow creates a GitHub release and publishes to npm.

Notes:
- Requires `NPM_TOKEN` secret with publish access.
- Publish step runs `pnpm publish --access public`.

## Acknowledgment

Special thanks to [react-grab](https://www.react-grab.com/) ([GitHub](https://github.com/aidenybai/react-grab)). This project was inspired by and references the excellent work done by the `react-grab` team. `vue-grab` aims to bring a similar developer experience to the Vue and Nuxt ecosystem.
