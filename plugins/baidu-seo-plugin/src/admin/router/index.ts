/**
 * routes
 */
import { RouteConfig } from 'vue-router';

export function interopDefault(promise: Promise<any>) {
  return promise.then((m) => m.default || m);
}

const routes: RouteConfig[] = [
  {
    path: 'baidu-seo-config',
    name: 'baidu-seo-config',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '../views/config')),
  },
];

export default routes;
