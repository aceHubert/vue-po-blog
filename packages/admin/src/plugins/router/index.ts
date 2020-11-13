import Vue from 'vue';
import { Route } from 'vue-router';
import { globalLocale } from '@/includes/functions';
import { ACCESS_TOKEN } from '@/config/mutationTypes';

// Types
import { Plugin } from '@nuxt/types';

// Utilities
import { genLocaleConfig } from './utils';

// 匿名允许路由名
const anonymousRouteNames = ['login'];

const plugin: Plugin = (cxt) => {
  const router = cxt.app.router!;
  const { localeRegexp, preferredLocale } = genLocaleConfig(globalLocale);

  router.beforeEach((to: Route, from: Route, next: any) => {
    const hasLogin = !!Vue.ls.get(ACCESS_TOKEN);
    // 没有授权，需要登录
    if (!anonymousRouteNames.includes(to.name!) && !hasLogin) {
      next({ name: 'login' });
    } else if (to.query.lang && !localeRegexp.test(to.query.lang as string)) {
      // 修正 query 上的语言
      to.query.lang = preferredLocale;
      next(to);
    } else {
      next();
    }
  });
};

export default plugin;
