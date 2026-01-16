import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit';

export type VueGrabNuxtModuleOptions = {
  enabled?: boolean;
  overlayStyle?: Record<string, string>;
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

    const publicConfig = (nuxt.options.runtimeConfig.public ||= {});
    publicConfig.vueGrab = {
      ...(publicConfig.vueGrab as Record<string, any> | undefined),
      ...options
    };

    const resolver = createResolver(import.meta.url);
    addPlugin(resolver.resolve('./runtime/plugin'));
  }
});
