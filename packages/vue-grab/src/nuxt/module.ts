import { addPlugin, createResolver, defineNuxtModule, addVitePlugin } from '@nuxt/kit';

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
  setup(options, nuxt) {
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

    addVitePlugin({
      name: 'vite-plugin-vue-grab-injector',
      enforce: 'post',
      transform(code, id) {
        if (!id.match(/\.vue($|\?)/) || id.includes('node_modules')) return;
        const [filename] = id.split('?');
        if (!filename) return;
        
        const file = filename.replace(nuxt.options.rootDir, '');
        
        const getLineCol = (index: number) => {
          const pre = code.slice(0, index);
          const lines = pre.split('\n');
          const line = lines.length;
          const column = lines[lines.length - 1].length + 1;
          return { line, column };
        };

        // 1. Handle "export default _sfc_main" (common in script setup)
        const matchVar = code.match(/export default\s+([a-zA-Z0-9_$]+)/);
        if (matchVar && matchVar.index !== undefined) {
          const name = matchVar[1];
          // For variable export, the definition is usually earlier. 
          // We can't easily find the definition line without parsing.
          // But we can fallback to 1, or try to find "const name ="?
          // For script setup, the variable is defined near the top or bottom.
          // Let's use 1 as fallback for variable export, or try to find definition.
          // Actually, let's just stick to file path for now for variable, or use 1.
          // Nuxt DevTools often uses 1 for SFCs unless it parses the template.
          const inject = `\n${name}.__file = ${JSON.stringify(file)};\n${name}.__line = 1;\n${name}.__column = 1;\n`;
          return {
            code: code.replace(matchVar[0], inject + matchVar[0]),
            map: null
          };
        }
        
        // 2. Handle "export default { ... }"
        const matchObj = code.match(/export default\s*\{/);
        if (matchObj && matchObj.index !== undefined) {
          const { line, column } = getLineCol(matchObj.index);
          return {
            code: code.replace(/export default\s*\{/, `export default { __file: ${JSON.stringify(file)}, __line: ${line}, __column: ${column},`),
            map: null
          };
        }
        
        // 3. Handle "export default defineComponent({ ... })"
        const matchDef = code.match(/export default\s+defineComponent\s*\(\s*\{/);
        if (matchDef && matchDef.index !== undefined) {
          const { line, column } = getLineCol(matchDef.index);
          return {
            code: code.replace(/export default\s+defineComponent\s*\(\s*\{/, `export default defineComponent({ __file: ${JSON.stringify(file)}, __line: ${line}, __column: ${column},`),
            map: null
          };
        }
      }
    });
  }
});
