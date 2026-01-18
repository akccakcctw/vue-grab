declare module '#app' {
  export function defineNuxtPlugin(plugin: any): any;
  export function useRuntimeConfig(): { public?: Record<string, any> };
}
