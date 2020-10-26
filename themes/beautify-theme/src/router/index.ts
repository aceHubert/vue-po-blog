/**
 * routes
 */
import { RouteConfig } from 'vue-router';

import { Route } from 'vue-router';

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
    path: 'article/:id',
    name: 'theme-article',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/article')),
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
    name: 'theme-search-keywords',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/search-result')),
    props: true,
  },
  {
    path: 'category/:id',
    name: 'theme-search-category',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/search-result')),
    props: (to: Route) => ({ type: 'category', id: to.params.id }),
  },
  {
    path: 'tag/:id',
    name: 'theme-search-tag',
    component: () => interopDefault(import(/* webpackChunkName: "views" */ '@/views/search-result')),
    props: (to: Route) => ({ type: 'tag', id: to.params.id }),
  },
];

export default routes;
