import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit';

export type VueGrabNuxtModuleOptions = {
  enabled?: boolean;
};

export default defineNuxtModule<VueGrabNuxtModuleOptions>({
  meta: {
    name: 'vue-grab',
    configKey: 'vueGrab'
  },
  defaults: {
    enabled: true
  },
  setup(options, nuxt) {
    if (options.enabled === false) return;
    if (!nuxt.options.dev) return;

    const resolver = createResolver(import.meta.url);
    addPlugin(resolver.resolve('./runtime/plugin'));
  }
});
