import Vue from 'vue';
import { MetaInfo } from 'vue-meta';
import VueRouter from 'vue-router';
import ModuleLoader from '@vue-async/module-loader';
import { error as globalError, warn as globalWarn } from '@vue-async/utils';
import { hook, themeFuncs } from '@/includes/functions';
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
  const { app, store } = cxt;
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

  const themeModule = await siteApi.getThemeModule();
  if (!themeModule) {
    globalError(process.env.NODE_ENV === 'production', `[core] 未配置主题模块`);
  } else {
    themeModule.args = _themeArgs;
  }

  // 传递到插件模块的参数
  const _pluginArgs: PluginOptions = Object.freeze({
    ...pluginArgs,
  });

  const pluginModules = await siteApi.getPluginModules();
  pluginModules.map((module) => {
    module.args = _pluginArgs;
  });

  const moduleLoader = new ModuleLoader({
    // 重写 addRouter，阻止 plugin 中调用
    addRoutes: () => {
      /** do nothing */
    },
  }).registerDynamicComponent(store);

  /**
   * 加载 theme 和 plugins, 按顺序执行
   */
  await moduleLoader.load([themeModule, ...pluginModules], {
    sync: true, // 同步执行，theme 优先加载，然后加载插件
    error: (msg: string) => {
      // 此处只会提示错误，不会阻止 success 执行
      globalWarn(false, `[core] 模块加载中出错，已忽略。 ${msg}`);
    },
  });

  cxt.app.moduleLoader = moduleLoader;
  // cxt.$moduleLoader = moduleLoader

  //
  // -- theme 与 plugins 加载完成，入口文件中的方法全部执行完成 --
  //

  /**
   * 生成 theme css 变量
   * todo: ssr
   */
  const _mounted = app.mounted;
  app.mounted = function () {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'plumemo-theme-stylesheet';
    style.setAttribute('data-n-head', 'plumemo');
    style.innerHTML = themeFuncs.genCssStyles();
    document.getElementsByTagName('head')[0].appendChild(style);
    _mounted && _mounted.call(this);
  };

  /**
   * 自定义 head title template
   */
  const _head = app.head! as MetaInfo;
  if (hook('head_title_template').has()) {
    await hook('head_title_template')
      .filter(_head.titleTemplate)
      .then((template) => {
        _head.titleTemplate = template;
      });
  }

  /**
   * 初始化（网站，用户，SEO 等配置加载完成）
   */
  await hook('init').exec(cxt);
};

export default plugin;
