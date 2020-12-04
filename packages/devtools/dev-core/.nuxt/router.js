import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

import _60d925c6 from '../src/views/index.tsx'
import _00ecbbd7 from '../src/layouts/error.tsx'

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
    path: "/",
    component: _60d925c6,
    name: "index"
  }, {
    path: "/error",
    component: _00ecbbd7,
    props: true,
    name: "error"
  }, {
    path: "*",
    component: _00ecbbd7,
    props: {"error":{"statusCode":404}}
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
