/**
 * routes
 */
// import { RouteConfig } from 'vue-router';

const routes: any = [
  {
    path: 'baidu-seo-config',
    name: 'baidu-seo-config',
    component: () => import(/* webpackChunkName: "router-theme" */ '@/admin/views/baidu-seo-config'),
  },
];

export default routes;
