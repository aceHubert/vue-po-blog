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
    path: 'article/:id',
    name: 'theme-article',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/article')),
  },
  {
    path: 'tag/:id',
    name: 'theme-tag',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/tag')),
    props: true,
  },
  {
    path: 'archive',
    name: 'theme-archive',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/archive')),
  },
  {
    path: 'about',
    name: 'theme-about-me',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/about-me')),
  },
  {
    path: 'search',
    name: 'theme-search',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/search')),
  },
  {
    path: 'search/:keywords',
    name: 'theme-search-result',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/search-result')),
    props: true,
  },
];

export default routes;
