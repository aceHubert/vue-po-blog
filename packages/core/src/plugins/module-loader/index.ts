import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import VueRouter from 'vue-router';
import ModuleLoader from '@vue-async/module-loader';
import { isUndef, error as globalError } from '@vue-async/utils';
import { hook, globalThemes, themeFuncs } from '@/includes/functions';
import { siteApi } from '@/includes/datas';

// megre routes
import { megreRoutes, root } from '../router/utils';

// args
import themeArgs from '@/includes/theme';
import pluginArgs from '@/includes/plugin';

// Types
import { Plugin } from '@nuxt/types';
import { ThemeOptions } from 'types/theme-options';
import { PluginOptions } from 'types/plugin-options';

Vue.use(ModuleLoader);

const plugin: Plugin = async (cxt) => {
  const { app } = cxt;
  /**
   * 添加路由
   * 放在模块入口文件 options 中，而不入在 Context 中，因为 Context 会传递到组件中
   * todo: 是否初始化多语言
   */
  const addRoutes: ThemeOptions['addRoutes'] = (routes, megreFn = megreRoutes) => {
    const options = (app.router as any).options;
    megreFn(options.routes, root(routes));
    const newRouter = new VueRouter(options);
    (app.router as any).matcher = (newRouter as any).matcher;
  };

  // 传递到主题模块的参数
  const _themeArgs: ThemeOptions = Object.freeze({
    ...themeArgs,
    addRoutes,
  });

  let themeModule: ModuleConfig | null = null;
  try {
    themeModule = await siteApi.getThemeModule();
    if (!themeModule) {
      globalError(process.env.NODE_ENV === 'production', `[core] 未配置主题模块`);
    } else {
      (themeModule as any).args = _themeArgs;
    }
  } catch {
    // todo:因为接口不通，暂时处理掉异常
  }

  // 传递到插件模块的参数
  const _pluginArgs: PluginOptions = Object.freeze({
    ...pluginArgs,
  });
  let pluginModules = [] as ModuleConfig[];
  try {
    pluginModules = await siteApi.getPluginModules();
    pluginModules.map((module) => {
      (module as any).args = _pluginArgs;
    });
  } catch {
    // todo:因为接口不通，暂时处理掉异常
  }

  // [
  //   // theme
  //   {
  //     moduleName: 'beautify-theme',
  //     entry: '/content/themes/plumemo-dev.umd.js',
  //     styles: ['/content/themes/plumemo-dev.css'],
  //     args: _themeArgs,
  //   },
  //   // plugin's entry
  //   {
  //     moduleName: 'comment-plugin',
  //     entry: '/content/plugins/comment-plugin/comment-plugin.umd.js',
  //     args: _pluginArgs,
  //   },
  // ],

  /**
   * 加载 theme 和 plugins, 按顺序执行
   */
  await Vue.prototype.$moduleLoader([themeModule, ...pluginModules], {
    sync: true,
    error: (msg: string) => {
      // 此处只会提示错误，不会阻止 success 执行
      // eslint-disable-next-line no-console
      console.error(`[core] 模块加载中出错，忽略。 ${msg}`);
    },
  });

  // const moduleLoader = function createModuleLoader(ssrContext: any) {
  //   const moduleLoader = new ModuleLoader({
  //     addRoutes, // 重写 addRouter
  //   });

  //   return moduleLoader;
  // };

  // cxt.app.moduleLoader = moduleLoader;
  // cxt.$moduleLoader = moduleLoader

  //
  // -- theme 与 plugins 加载完成，入口文件中的方法全部执行完成 --
  //

  /**
   * 生成 css 变量
   */
  new Vue().$watch(
    () => globalThemes,
    () => {
      const _head = app.head! as MetaInfo;
      let themeSheet = null;
      if (isUndef(_head.style)) {
        _head.style = [];
      }
      if (_head.style!.length && (themeSheet = _head.style!.find(({ id }) => id === 'plumemo-theme-stylesheet'))) {
        themeSheet.cssText = themeFuncs.genCssVariables();
      } else {
        _head.style!.push({
          id: 'plumemo-theme-stylesheet',
          type: 'text/css',
          'data-n-head': 'plumemo',
          cssText: themeFuncs.genCssVariables(),
        });
      }
    },
    {
      immediate: true,
    },
  );

  /**
   * 初始化（网站，用户，SEO 等配置加载完成）
   */
  await hook('init').exec(cxt);
};

export default plugin;
