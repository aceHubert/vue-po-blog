/**
 * routes
 */
// import { RouteConfig } from 'vue-router';

export function interopDefault(promise: Promise<any>) {
  return promise.then((m) => m.default || m);
}

const routes: any = [
  {
    path: '',
    name: 'index',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views')),
  },
  {
    path: 'post',
    name: 'theme-post',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/post')),
  },
];

export default routes;
