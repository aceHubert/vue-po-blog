/**
 * routes
 */
import { RouteConfig } from 'vue-router';

// import { Route } from 'vue-router';

export function interopDefault(promise: Promise<any>) {
  return promise.then((m) => m.default || m);
}

const routes: RouteConfig[] = [
  {
    path: '',
    name: 'index',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views')),
  },
  {
    path: ':id',
    name: 'detail',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/detail')),
  },
];

export default routes;
