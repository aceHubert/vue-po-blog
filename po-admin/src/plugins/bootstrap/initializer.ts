/**
 * 从 localeStorage/cookie 初始化站点配置
 * 从服务端获取站点和个人配置
 * 公共方法的配置
 */
import Vue from 'vue';
import Axios from 'axios';
import { hasOwn, error as globalError } from '@vue-async/utils';
import { httpClient, graphqlClient, hook, globalSettings } from '@/includes/functions';
import { appStore, userStore } from '@/store/modules';
import * as directives from '@/directives';
import * as filters from '@/filters';
import cookie from '@/utils/cookie';
import { ACCESS_TOKEN, LOCALE } from '@/configs/settings.config';

// 添加到 Vue.protytype 上的属性和方法
import prototypeArgs from '@/includes/prototype';

// Types
import { DirectiveOptions, DirectiveFunction } from 'vue';
import { Plugin } from '@nuxt/types';

// Register global directives
Object.keys(directives).map((key) => {
  Vue.directive(key, (directives as Dictionary<DirectiveOptions | DirectiveFunction>)[key]);
});

// Register global filters
Object.keys(filters).map((key) => {
  Vue.filter(key, (filters as Dictionary<Function>)[key]);
});

// 注入 httpClient 和 graphqlClient 到 Vue
Vue.axios = Axios;
Vue.httpClient = httpClient;
Vue.graphqlClient = graphqlClient;

// 注入公共方法到 Vue 实例上
// (global mixin 必须在 created 之后才可以被调用, 这里使用 defineProperties)
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
})({ ...prototypeArgs, axios: Axios, httpClient, graphqlClient });

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

export async function Initializer(...params: Parameters<Plugin>) {
  const cxt = params[0];
  const inject = params[1];
  const { app, route, $config } = cxt;

  /**
   *  注册公共方法到 Context上
   */
  cxt.axios = Axios;
  cxt.httpClient = httpClient;
  cxt.graphqlClient = graphqlClient;

  Object.keys(prototypeArgs).forEach((key) => {
    // @ts-ignore
    cxt[key] = prototypeArgs[key];
  });

  /**
   * root vue created/mounted 勾子
   */
  const _created = app.created;
  const _mounted = app.mounted;
  app.created = function created() {
    hook('app:created').exec();
    _created && _created.call(this);
  };
  app.mounted = function mounted() {
    hook('app:mounted').exec();
    _mounted && _mounted.call(this);
  };

  /**
   * 设置全局配置
   */
  globalSettings.serverUrl = $config['server_url'] || '';
  globalSettings.basePath = app.router!.options.base || '';

  // 初始化项目之后才能读取数据库
  if (route.name !== 'init') {
    // login/logout/register/lost-password 页面排除
    if (!route.name?.startsWith('account-')) {
      // 设置token
      const accessToken = process.client
        ? cookie.clientCookie.get(ACCESS_TOKEN)
        : cookie.serverCookie(cxt.req, cxt.res).get(ACCESS_TOKEN);

      if (accessToken) {
        userStore.setAccessToken(accessToken);
      }
    }

    // 加载网站配置文件， autoload: Yes
    const autoloadOptions = await appStore.getAutoLoadOptions().catch((err) => {
      globalError(process.env.NODE_ENV === 'production', err.message);
      return {} as Dictionary<string>;
    });

    // 设置用户角色配置
    let userRoles;
    if ((userRoles = autoloadOptions['user_roles'])) {
      userStore.setRoleCapabilities(JSON.parse(userRoles));
    }

    // 个人站点配置
    // localeFromUser > localeFromCookie > siteLocale
    let siteLocale = autoloadOptions['locale'];
    const localeFromCookie = process.client
      ? cookie.clientCookie.get(LOCALE)
      : cookie.serverCookie(cxt.req, cxt.res).get(LOCALE);
    if (localeFromCookie) {
      siteLocale = localeFromCookie;
    }
    await userStore
      .getUserInfo()
      .then(() => {
        if (userStore.info.locale) {
          siteLocale = userStore.info.locale;
        }
      })
      .catch(() => {
        // ate by dog
      });
    appStore.setLocale(siteLocale);
    appStore.setSupportLanguages(JSON.parse(autoloadOptions['support_languages'] || '[]'));
    appStore.setAdminLayout(JSON.parse(autoloadOptions['admin_layout'] || '{}'));

    inject('userOptions', autoloadOptions);
  }
}
