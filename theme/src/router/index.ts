/**
 * routes
 */
// import { RouteConfig } from 'vue-router';

import Home from '@/views';

export function interopDefault(promise: Promise<any>) {
  return promise.then((m) => m.default || m);
}

const routes: any = [
  {
    path: '',
    name: 'index',
    component: Home,
  },
  {
    path: 'post',
    name: 'theme-post',
    component: () => interopDefault(import(/* webpackChunkName: "views/post" */'@/views/post')),
  },
];

export default routes;
