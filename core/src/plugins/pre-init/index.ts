import Vue from 'vue';
import Axios from 'axios';
import { http, post, site } from '@/includes';
import { error as globalError, hasOwn } from '@vue-async/utils';

// stores
import AppStore from '@/store/modules/app';

// components
import PluginHolder from '@/components/PluginHolder';

// 添加到 Vue.protytype 上的属性和方法
import * as prototypeArgs from '@/includes/prototype';

// Types
import { Plugin } from '@nuxt/types';
import { Settings } from 'types/functions/site';

// 注入 http 到 Vue
Vue.axios = Axios;
Vue.$http = http;

const plugin: Plugin = async (cxt) => {
  const { app } = cxt;
  /**
   * 加载网站配置文件
   */
  const metaKeys = ['description', 'keywords'];
  const metas: Array<{ name: string; content: any }> = []; // 提升给后面使用
  try {
    const configs = await site.getConfigs();
    const settings: Partial<Settings> = {};

    Object.keys(configs).forEach((key) => {
      if (hasOwn(AppStore.settings, key)) {
        settings[key as keyof Settings] = configs[key];
      } else if (metaKeys.some((metaKey) => metaKey === key)) {
        metas.push({
          name: key,
          content: configs[key],
        });
      }
    });

    AppStore.SetSetting(settings);
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] 站点配置文件加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: '站点配置文件加载失败' });
  }

  /**
   * 加载用户配置
   */
  try {
    // todo:
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] 用户配置文件加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: '用户配置文件加载失败' });
  }

  /**
   * 加载主题配置
   */
  try {
    // todo:
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] 主题配置文件加载失败, 错误：${err.message}`);
    // error({ statusCode: 500, message: '主题配置文件加载失败' });
  }

  /**
   * SEO配置
   */
  try {
    metas.forEach((meta) => {
      (app.head! as any).meta.push(meta);
    });
  } catch (err) {
    globalError(process.env.NODE_ENV === 'production', `[core] SEO配置文件加载失败, 错误：${err.message}`);
    // ignore error
  }

  /**
   * 注册全局组件
   */
  Vue.component(PluginHolder.name, PluginHolder);

  /**
   *  注册全局方法
   * (global mixin 必须在 created 之后才可以被调用, 所以这里使用 defineProperties)
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
          });
        return prev;
      }, {} as PropertyDescriptorMap),
    );
  })({ ...prototypeArgs, axios: Axios, $http: http });

  /**
   * 添加 http 到 Context
   */
  cxt.axios = Axios;
  cxt.$http = http;
  cxt.post = post;
  cxt.site = site;
};

export default plugin;
