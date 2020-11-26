import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _809e7a42 = () => interopDefault(import('../src/views/404.vue' /* webpackChunkName: "views/404" */))
const _f21fe6b4 = () => interopDefault(import('../src/views/articles.vue' /* webpackChunkName: "views/articles" */))
const _826402ae = () => interopDefault(import('../src/views/articles/index.vue' /* webpackChunkName: "views/articles/index" */))
const _42a62135 = () => interopDefault(import('../src/views/articles/create.vue' /* webpackChunkName: "views/articles/create" */))
const _5824d15e = () => interopDefault(import('../src/views/articles/_id.vue' /* webpackChunkName: "views/articles/_id" */))
const _05f970f0 = () => interopDefault(import('../src/views/categories/index.vue' /* webpackChunkName: "views/categories/index" */))
const _20d02d3e = () => interopDefault(import('../src/views/dashboard/index.vue' /* webpackChunkName: "views/dashboard/index" */))
const _f82e3e60 = () => interopDefault(import('../src/views/login.vue' /* webpackChunkName: "views/login" */))
const _4ead2290 = () => interopDefault(import('../src/views/medias.vue' /* webpackChunkName: "views/medias" */))
const _06b3e98a = () => interopDefault(import('../src/views/medias/index.vue' /* webpackChunkName: "views/medias/index" */))
const _8060b23a = () => interopDefault(import('../src/views/medias/create.vue' /* webpackChunkName: "views/medias/create" */))
const _201d3bab = () => interopDefault(import('../src/views/pages.vue' /* webpackChunkName: "views/pages" */))
const _4f9b15ee = () => interopDefault(import('../src/views/pages/index.vue' /* webpackChunkName: "views/pages/index" */))
const _69081ae0 = () => interopDefault(import('../src/views/pages/create.vue' /* webpackChunkName: "views/pages/create" */))
const _42bdb30a = () => interopDefault(import('../src/views/plugins/index.vue' /* webpackChunkName: "views/plugins/index" */))
const _8582d8e8 = () => interopDefault(import('../src/views/settings.vue' /* webpackChunkName: "views/settings" */))
const _767010e5 = () => interopDefault(import('../src/views/settings/general.vue' /* webpackChunkName: "views/settings/general" */))
const _74572e05 = () => interopDefault(import('../src/views/tags/index.vue' /* webpackChunkName: "views/tags/index" */))
const _f473601a = () => interopDefault(import('../src/views/themes.vue' /* webpackChunkName: "views/themes" */))
const _20345794 = () => interopDefault(import('../src/views/themes/index.vue' /* webpackChunkName: "views/themes/index" */))
const _d3cbab72 = () => interopDefault(import('../src/views/themes/color.vue' /* webpackChunkName: "views/themes/color" */))
const _7f425127 = () => interopDefault(import('../src/views/themes/customize.vue' /* webpackChunkName: "views/themes/customize" */))
const _46a92093 = () => interopDefault(import('../src/views/themes/widgets.vue' /* webpackChunkName: "views/themes/widgets" */))
const _5ab99b7c = () => interopDefault(import('../src/views/tools.vue' /* webpackChunkName: "views/tools" */))
const _e9bbea5e = () => interopDefault(import('../src/views/tools/export.vue' /* webpackChunkName: "views/tools/export" */))
const _0551eb7c = () => interopDefault(import('../src/views/tools/import.vue' /* webpackChunkName: "views/tools/import" */))
const _22df0b2e = () => interopDefault(import('../src/views/account/settings.vue' /* webpackChunkName: "views/account/settings" */))
const _4d521856 = () => interopDefault(import('../src/views/account/user.vue' /* webpackChunkName: "views/account/user" */))
const _69cc1794 = () => interopDefault(import('../src/views/categories/create.vue' /* webpackChunkName: "views/categories/create" */))
const _2b0cddb2 = () => interopDefault(import('../src/views/plugins/installed.vue' /* webpackChunkName: "views/plugins/installed" */))
const _3e42dd59 = () => interopDefault(import('../src/views/tags/create.vue' /* webpackChunkName: "views/tags/create" */))

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
    component: _809e7a42,
    name: "404"
  }, {
    path: "/articles",
    component: _f21fe6b4,
    children: [{
      path: "",
      component: _826402ae,
      meta: {"title":"Articles","keepAlive":true},
      name: "articles"
    }, {
      path: "create",
      component: _42a62135,
      meta: {"title":"Create"},
      name: "articles-create"
    }, {
      path: ":id",
      component: _5824d15e,
      meta: {"title":"Edit"},
      name: "articles-edit"
    }]
  }, {
    path: "/categories",
    component: _05f970f0,
    name: "categories"
  }, {
    path: "/dashboard",
    component: _20d02d3e,
    name: "dashboard"
  }, {
    path: "/login",
    component: _f82e3e60,
    name: "login"
  }, {
    path: "/medias",
    component: _4ead2290,
    children: [{
      path: "",
      component: _06b3e98a,
      name: "medias"
    }, {
      path: "create",
      component: _8060b23a,
      name: "medias-create"
    }]
  }, {
    path: "/pages",
    component: _201d3bab,
    children: [{
      path: "",
      component: _4f9b15ee,
      name: "pages"
    }, {
      path: "create",
      component: _69081ae0,
      name: "pages-create"
    }]
  }, {
    path: "/plugins",
    component: _42bdb30a,
    name: "plugins"
  }, {
    path: "/settings",
    component: _8582d8e8,
    name: "settings",
    children: [{
      path: "general",
      component: _767010e5,
      name: "settings-general"
    }]
  }, {
    path: "/tags",
    component: _74572e05,
    name: "tags"
  }, {
    path: "/themes",
    component: _f473601a,
    children: [{
      path: "",
      component: _20345794,
      name: "themes"
    }, {
      path: "color",
      component: _d3cbab72,
      name: "themes-color"
    }, {
      path: "customize",
      component: _7f425127,
      name: "themes-customize"
    }, {
      path: "widgets",
      component: _46a92093,
      name: "themes-widgets"
    }]
  }, {
    path: "/tools",
    component: _5ab99b7c,
    name: "tools",
    children: [{
      path: "export",
      component: _e9bbea5e,
      name: "tools-export"
    }, {
      path: "import",
      component: _0551eb7c,
      name: "tools-import"
    }]
  }, {
    path: "/account/settings",
    component: _22df0b2e,
    name: "account-settings"
  }, {
    path: "/account/user",
    component: _4d521856,
    name: "account-user"
  }, {
    path: "/categories/create",
    component: _69cc1794,
    name: "categories-create"
  }, {
    path: "/plugins/installed",
    component: _2b0cddb2,
    name: "plugins-installed"
  }, {
    path: "/tags/create",
    component: _3e42dd59,
    name: "tags-create"
  }, {
    path: "/",
    redirect: {"name":"dashboard"}
  }, {
    path: "*",
    redirect: {"name":"404"}
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
