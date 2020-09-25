import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _5e75607c = () => interopDefault(import('../src/views/404.tsx' /* webpackChunkName: "views/404" */))
const _8b1c9e54 = () => interopDefault(import('../src/views/index.tsx' /* webpackChunkName: "views/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/404",
    component: _5e75607c,
    name: "404"
  }, {
    path: "/",
    component: _8b1c9e54,
    name: "index"
  }, {
    path: "*",
    redirect: {"name":"404"}
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
