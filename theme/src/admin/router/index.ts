/**
 * routes
 */
// import { RouteConfig } from 'vue-router';

const routes: any = [
  {
    path: 'theme/setting',
    name: 'theme-setting',
    component: () => import(/* webpackChunkName: "router-theme" */ '@/admin/views/setting'),
  },
];

export default routes;
