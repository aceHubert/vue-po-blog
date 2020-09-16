import Vue from 'vue';
import ModuleLoader from '@vue-async/module-loader';

// hook
import { hook } from '@/includes';

// args
import * as themeArgs from '@/includes/theme';
import * as pluginArgs from '@/includes/plugin';

// Types
import { Plugin } from '@nuxt/types';

Vue.use(ModuleLoader);

const plugin: Plugin = async (cxt) => {
  await Vue.prototype.$moduleLoader(
    [
      // theme
      {
        moduleName: 'beautify-theme',
        entry: '/content/theme/beautify-theme/beautify-theme.umd.js',
        styles: ['/content/theme/beautify-theme/beautify-theme.css'],
        args: {
          ...themeArgs,
        },
      },
      // plugin's entry
      {
        moduleName: 'comment-plugin',
        entry: '/content/plugins/comment-plugin/comment-plugin.umd.js',
        args: {
          ...pluginArgs,
        },
      },
    ],
    {
      sync: true,
      error: (msg: string) => {
        // 此处只会提示错误，不会阻止 success 执行
        // eslint-disable-next-line no-console
        console.error(`[core] 模块加载中出错，忽略。 ${msg}`);
      },
    },
  );

  // const moduleLoader = function createModuleLoader(ssrContext: any) {
  //   const moduleLoader = new ModuleLoader({
  //     addRoutes, // 重写 addRouter
  //   });

  //   return moduleLoader;
  // };

  // cxt.app.moduleLoader = moduleLoader;
  // cxt.$moduleLoader = moduleLoader

  // 初始化（网站，用户，SEO 等配置加载完成）
  await hook('init').exec(cxt);
};

export default plugin;
