import Vue from 'vue';
import Axios from 'axios';
import { error as globalError, hasOwn } from '@vue-async/utils';
import { hook, http, themeFuncs, settingsFuncs } from '@/includes/functions';
import { tagApi, articleApi, siteApi, categoryApi } from '@/includes/datas';
import themeFn from '@/includes/theme';

// components
import PluginHolder from '~/components/PluginHolder';

// 添加到 Vue.protytype 上的属性和方法
import prototypeArgs from '@/includes/prototype';

// Types
import { Plugin } from '@nuxt/types';

// 注入 http 到 Vue
Vue.axios = Axios;
Vue.$http = http;

const plugin: Plugin = async (cxt) => {
  const { app } = cxt;
  /**
   * 加载网站配置文件
   */
  const metaKeys = ['description', 'keywords'];
  const metas: Array<{ name: string; content: any }> = []; // 提升给后面SEO使用
  try {
    const configs = await siteApi.getConfigs();
    const settings: Dictionary<any> = {};

    Object.keys(configs).forEach((key) => {
      // todo: 待 seo 配置接口分离
      if (metaKeys.some((metaKey) => metaKey === key)) {
        metas.push({
          name: key,
          content: configs[key],
        });
      } else {
        settings[key] = configs[key];
      }
    });

    settingsFuncs.setSiteSettings(settings);
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] 站点配置加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: '站点配置加载失败' });
  }

  /**
   * SEO配置
   */
  try {
    metas.forEach((meta) => {
      (app.head! as any).meta.push(meta);
    });
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] SEO配置加载失败, 错误：${err.message}`);
    // ignore error
  }

  /**
   * 加载用户配置
   */
  try {
    const configs = await siteApi.getUserInfo();
    settingsFuncs.setUserInfo(configs);
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] 用户配置加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: '用户配置加载失败' });
  }

  /**
   * 加载主题色配置
   */
  try {
    const configs = await siteApi.getTheme();
    themeFn.setThemes(configs.dark, configs.themes);
    themeFn.setDarkTheme(configs.dark);
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] Theme配置加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: 'Theme配置加载失败' });
  }

  /**
   * 加载 Widgets 配置
   */
  try {
    // todo
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] Widget配置加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: 'Widget配置加载失败' });
  }

  /**
   * 注册全局组件
   */
  Vue.component(PluginHolder.name, PluginHolder);

  /**
   *  注册全局方法
   * (global mixin 必须在 created 之后才可以被调用, 这里使用 defineProperties)
   * prototypeAres 已包含 api 部分
   */
  ((methods: Dictionary<any> = {}) => {
    Object.defineProperties(
      Vue.prototype,
      Object.keys(methods).reduce((prev, name) => {
        !hasOwn(prev, name) &&
          (prev[name] = {
            get() {
              return methods[name];
            },
            enumerable: true,
            configurable: true,
          });
        return prev;
      }, {} as PropertyDescriptorMap),
    );
  })({ ...prototypeArgs, axios: Axios, $http: http });

  /**
   * root vue created/mounted 勾子
   */
  const _created = app.created;
  const _mounted = app.mounted;
  app.created = function created() {
    hook('app_created').exec();
    _created && _created.call(this);
  };
  app.mounted = function mounted() {
    // 生成 theme css 变量, todo: ssr
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'plumemo-theme-stylesheet';
    style.setAttribute('data-n-head', 'plumemo');
    style.innerHTML = themeFuncs.genCssStyles();
    document.getElementsByTagName('head')[0].appendChild(style);

    hook('app_mounted').exec();
    _mounted && _mounted.call(this);
  };

  /**
   * 添加 http and apis 到 Context
   */
  cxt.axios = Axios;
  cxt.$http = http;

  /**
   * for asyncData
   */
  cxt.categoryApi = categoryApi;
  cxt.tagApi = tagApi;
  cxt.articleApi = articleApi;
  // cxt.siteApi = siteApi; // 暂时不导出，仅内部使用
};

export default plugin;
