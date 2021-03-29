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
import config, {
  SET_LAYOUT,
  SET_THEME,
  SET_PRIMARY_COLOR,
  SET_CONTENT_WIDTH,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIX_SIDEBAR,
  TOGGLE_SIDE_COLLAPSED,
  TOGGLE_COLOR_WEAK,
  TOGGLE_AUTO_HIDE_HEADER,
  TOGGLE_MULTI_TAB,
  ACCESS_TOKEN,
  LOCALE,
} from '@/config/proLayoutConfigs';

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
   * 主题配置
   */
  if (process.client) {
    appStore.setLayout(Vue.ls.get(SET_LAYOUT, config.settings.layout));
    appStore.setTheme(Vue.ls.get(SET_THEME, config.settings.theme));
    appStore.setPrimaryColor(Vue.ls.get(SET_PRIMARY_COLOR, config.settings.primaryColor));
    appStore.setContentWidth(Vue.ls.get(SET_CONTENT_WIDTH, config.settings.contentWidth));
    appStore.toggleFixedHeader(Vue.ls.get(TOGGLE_FIXED_HEADER, config.settings.fixedHeader));
    appStore.toggleFixSidebar(Vue.ls.get(TOGGLE_FIX_SIDEBAR, config.settings.fixSiderbar));
    appStore.toggleSideCollapsed(Vue.ls.get(TOGGLE_SIDE_COLLAPSED, config.settings.sideCollapsed));
    appStore.toggleSideCollapsed(Vue.ls.get(TOGGLE_COLOR_WEAK, config.settings.colorWeak));
    appStore.toggleAutoHideHeader(Vue.ls.get(TOGGLE_AUTO_HIDE_HEADER, config.settings.autoHideHeader));
    appStore.toggleMultiTab(Vue.ls.get(TOGGLE_MULTI_TAB, config.settings.multiTab));
  } else {
    // ssr
  }

  /**
   * 修改全局配置
   */
  globalSettings.baseUrl = $config['baseUrl'] || '';
  globalSettings.basePath = app.router!.options.base || '';

  // 不在项目初始货页面时，才能读取数据库
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
      userStore.setUserRoles(JSON.parse(userRoles));
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
      .getUserMetas()
      .then(() => {
        if (userStore.info.locale) {
          siteLocale = userStore.info.locale;
        }
      })
      .catch(() => {
        // ate by dog
      });
    appStore.setLocale(siteLocale);

    inject('userOptions', autoloadOptions);
  }
}
