import { addPlugin, createResolver, defineNuxtModule, addVitePlugin } from '@nuxt/kit';
import { createVueGrabVitePlugin } from '../vite.js';

export type VueGrabNuxtModuleOptions = {
  enabled?: boolean;
  overlayStyle?: Record<string, string>;
  copyOnClick?: boolean;
  rootDir?: string;
};

export default defineNuxtModule<VueGrabNuxtModuleOptions>({
  meta: {
    name: 'vue-grab',
    configKey: 'vueGrab'
  },
  defaults: {
    enabled: true
  },
  setup(options: VueGrabNuxtModuleOptions, nuxt: any) {
    if (options.enabled === false) return;
    const shouldEnable = nuxt.options.dev || options.enabled === true;
    if (!shouldEnable) return;

    const publicConfig = (nuxt.options.runtimeConfig.public ||= {});
    const { enabled, overlayStyle, copyOnClick, rootDir } = options;
    publicConfig.vueGrab = {
      ...(publicConfig.vueGrab as Record<string, any> | undefined),
      enabled,
      overlayStyle,
      copyOnClick,
      rootDir: rootDir || nuxt.options.rootDir
    };

    nuxt.options.build.transpile = nuxt.options.build.transpile || [];
    if (!nuxt.options.build.transpile.includes('vue-grab')) {
      nuxt.options.build.transpile.push('vue-grab');
    }

    const resolver = createResolver(import.meta.url);
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client'
    });

    addVitePlugin(
      createVueGrabVitePlugin({
        enabled: true,
        rootDir: rootDir || nuxt.options.rootDir
      })
    );
  }
});
