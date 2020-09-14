import Vue from 'vue';
import Axios from 'axios';
import { http } from '@/includes';
import { error } from '@vue-async/utils';

// stores
import AppStore from '@/store/modules/app';

// components
import PluginHolder from '@/components/PluginHolder';

// hook
import { hook } from '@/includes';

// datas
import * as post from '@/includes/datas/post';

// Types
import { Plugin } from '@nuxt/types';

// 注入 http 到 Vue
Vue.axios = Axios;
// Vue.$http = axios;
Vue.$http = http;

Object.defineProperties(Vue.prototype, {
  axios: {
    get() {
      return Axios;
    },
  },

  $http: {
    get() {
      // return axios;
      return http;
    },
  },
});

const plugin: Plugin = async (cxt) => {
  /**
   * 加载网站配置文件
   */
  try {
    const config = await Axios.get('/settings.json');
    AppStore.SetSetting(config as any);
  } catch (err) {
    // todo: ssr
    error(process.env.NODE_ENV === 'production', `[core] 站点配置文件加载失败, 错误：${err.message}`);
    // document.querySelector('#app')!.innerHTML = '站点配置文件加载失败';
    throw new Error('站点配置文件加载失败');
  }

  /**
   * 加载用户配置
   */
  try {
    // todo:
  } catch (err) {
    // todo: ssr
    error(process.env.NODE_ENV === 'production', `[core] 用户配置文件加载失败, 错误：${err.message}`);
    // document.querySelector('#app')!.innerHTML = '用户配置文件加载失败';
    throw new Error('用户配置文件加载失败');
  }

  /**
   * SEO配置
   */
  try {
    // todo
    const metas: Dictionary<any>[] = [];
    metas.forEach((meta) => {
      (cxt.app.head! as any).meta.push(meta);
    });
  } catch (err) {
    // todo: ssr
    error(process.env.NODE_ENV === 'production', `[core] SEO配置文件加载失败, 错误：${err.message}`);
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
  ((methods: Dictionary<Function> = {}) => {
    Object.defineProperties(
      Vue.prototype,
      Object.keys(methods).reduce((prev, methodName) => {
        prev[methodName] = {
          get() {
            return methods[methodName];
          },
        };
        return prev;
      }, {} as PropertyDescriptorMap),
    );
  })({ ...post, hook });

  /**
   * 注入全局 http
   */
  cxt.axios = Axios;
  cxt.$http = http;
};

export default plugin;
