import VueRouter, { RouteConfig, Route } from 'vue-router';
import AppStore from '@/store/modules/app';

// Types
import { Plugin } from '@nuxt/types';

// Utilities
import { root, genLocaleConfig } from './utils';

// 合并路由（将新路由配置合并到老路由配置中）
const megreRoutes = (oldRoutes: RouteConfig[], newRoutes: RouteConfig[]) => {
  newRoutes.forEach((current: RouteConfig) => {
    const matchRoute = oldRoutes.find(
      (route: RouteConfig) => (current.name && route.name === current.name) || route.path === current.path,
    );
    if (matchRoute) {
      // 如果找到已在在的
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { children, name, ...restOptions } = current;
      Object.assign(matchRoute, restOptions); // 合并路由参数

      if (children) {
        !matchRoute.children && (matchRoute.children = []);
        megreRoutes(matchRoute.children, children);
      }
    } else {
      // 插入到 path:'*'之前
      const insertIndex = oldRoutes.findIndex((route: RouteConfig) => route.path === '*');
      // 如果没找到
      oldRoutes.splice(insertIndex < 0 ? 0 : insertIndex, 0, current);
    }
  });
};

const plugin: Plugin = (cxt) => {
  const router = cxt.app.router!;

  router.beforeEach((to: Route, from: Route, next: any) => {
    const { languageRegexp, preferredLanguage } = genLocaleConfig(AppStore.locale);
    if (to.query.lang && !languageRegexp.test(to.query.lang as string)) {
      to.query.lang = preferredLanguage;
      next(to);
    } else {
      next();
    }
  });

  // 动态添加路由
  cxt.addRoutes = (routes: RouteConfig[]) => {
    const options = (router as any).options;
    megreRoutes(options.routes, root(routes));
    const newRouter = new VueRouter(options);
    (router as any).matcher = (newRouter as any).matcher;
  };
};

export default plugin;
