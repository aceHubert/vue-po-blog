import Vue from 'vue';
import Axios from 'axios';
import { hasOwn, error as globalError } from '@vue-async/utils';
import { httpClient, graphqlClient, hook, globalSettings } from '@/includes/functions';
import * as directives from '@/directives';
import * as filters from '@/filters';
import appStore from '@/store/modules/app';
import userStore from '@/store/modules/user';

// 添加到 Vue.protytype 上的属性和方法
import prototypeArgs from '@/includes/prototype';

// Types
import { DirectiveOptions, DirectiveFunction } from 'vue';
import { Plugin } from '@nuxt/types';

// Register global directives
Object.keys(directives).map((key) => {
  Vue.directive(key, (directives as Dictionary<DirectiveOptions | DirectiveFunction>)[key]);
});

// Register global filter functions
Object.keys(filters).map((key) => {
  Vue.filter(key, (filters as Dictionary<Function>)[key]);
});

// 注入 httpClient 各 graphqlClient 到 Vue
Vue.axios = Axios;
Vue.httpClient = httpClient;
Vue.graphqlClient = graphqlClient;

// 异常处理
Vue.config.errorHandler = function (err: Error, vm: Vue, info: string) {
  if (process.env.NODE_ENV === 'production') {
    // todo: 总的 error 处理, 推送到服务端
  } else {
    globalError(false, `[core] Error(${info})：${err.message || err}`, vm);
  }

  if (vm && vm.$root) {
    // do something if vue instance is exists
  }
};

export async function PrepareDatas(...params: Parameters<Plugin>) {
  const cxt = params[0];
  const inject = params[1];
  const { app, route, $i18n, $config } = cxt;

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
    // userStore.getUserMetas(['locale']).then(() => {
    //   if (userStore.info['locale']) {
    //     $i18n.locale = userStore.info['locale'];
    //   }
    // });

    hook('app_mounted').exec();
    _mounted && _mounted.call(this);
  };

  /**
   *  注册全局方法
   * prototypeAres 已包含 api 部分
   */
  ((methods: Dictionary<any> = {}) => {
    // (global mixin 必须在 created 之后才可以被调用, 这里使用 defineProperties)
    Object.defineProperties(
      Vue.prototype,
      Object.keys(methods).reduce((prev, name) => {
        // 同时也注册到 Context
        // @ts-ignore
        cxt[name] = methods[name];

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
  })({ ...prototypeArgs, axios: Axios, httpClient, graphqlClient });

  /**
   * 修改全局配置
   */
  globalSettings.baseUrl = $config['baseUrl'] || '';

  // 不在项目初始货页面时，才能读取数据库
  if (route.name !== 'init') {
    // 加载网站配置文件， autoload: Yes
    const autoloadOptions = await appStore.getAutoLoadOptions().catch((err) => {
      globalError(process.env.NODE_ENV === 'production', err.message);
      return {} as Dictionary<string>;
    });

    // 设置用户角色
    let userRoles;
    if ((userRoles = autoloadOptions['user_roles'])) {
      userStore.setUserRoles(JSON.parse(userRoles));
    }

    // 设置站点语言
    let siteLocale;
    if ((siteLocale = autoloadOptions['locale'])) {
      $i18n.locale = siteLocale;
    }

    inject('userOptions', autoloadOptions);
  }
}
