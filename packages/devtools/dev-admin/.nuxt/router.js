import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _8b5ad462 = () => interopDefault(import('../src/views/404.vue' /* webpackChunkName: "views/404" */))
const _07a6e094 = () => interopDefault(import('../src/views/articles.vue' /* webpackChunkName: "views/articles" */))
const _75bff5b9 = () => interopDefault(import('../src/views/articles/index.vue' /* webpackChunkName: "views/articles/index" */))
const _69f30c25 = () => interopDefault(import('../src/views/articles/create.vue' /* webpackChunkName: "views/articles/create" */))
const _fbdbdb3e = () => interopDefault(import('../src/views/articles/_id.vue' /* webpackChunkName: "views/articles/_id" */))
const _81588ad0 = () => interopDefault(import('../src/views/categories/index.vue' /* webpackChunkName: "views/categories/index" */))
const _481d182e = () => interopDefault(import('../src/views/dashboard/index.vue' /* webpackChunkName: "views/dashboard/index" */))
const _5d61b7c0 = () => interopDefault(import('../src/views/login.vue' /* webpackChunkName: "views/login" */))
const _2e4b75c8 = () => interopDefault(import('../src/views/medias.vue' /* webpackChunkName: "views/medias" */))
const _aa6af36a = () => interopDefault(import('../src/views/medias/index.vue' /* webpackChunkName: "views/medias/index" */))
const _538ae45a = () => interopDefault(import('../src/views/medias/create.vue' /* webpackChunkName: "views/medias/create" */))
const _0cd3daca = () => interopDefault(import('../src/views/pages.vue' /* webpackChunkName: "views/pages" */))
const _3c72f8de = () => interopDefault(import('../src/views/pages/index.vue' /* webpackChunkName: "views/pages/index" */))
const _79a06da0 = () => interopDefault(import('../src/views/pages/create.vue' /* webpackChunkName: "views/pages/create" */))
const _592899fa = () => interopDefault(import('../src/views/plugins/index.vue' /* webpackChunkName: "views/plugins/index" */))
const _327b169c = () => interopDefault(import('../src/views/settings.vue' /* webpackChunkName: "views/settings" */))
const _38c083f5 = () => interopDefault(import('../src/views/settings/general.vue' /* webpackChunkName: "views/settings/general" */))
const _e701a5d6 = () => interopDefault(import('../src/views/tags/index.vue' /* webpackChunkName: "views/tags/index" */))
const _492f51fa = () => interopDefault(import('../src/views/themes.vue' /* webpackChunkName: "views/themes" */))
const _c3eb6174 = () => interopDefault(import('../src/views/themes/index.vue' /* webpackChunkName: "views/themes/index" */))
const _443ea557 = () => interopDefault(import('../src/views/themes/color.vue' /* webpackChunkName: "views/themes/color" */))
const _4192c437 = () => interopDefault(import('../src/views/themes/customize.vue' /* webpackChunkName: "views/themes/customize" */))
const _04c9d0ba = () => interopDefault(import('../src/views/themes/widgets.vue' /* webpackChunkName: "views/themes/widgets" */))
const _a7c7ed9c = () => interopDefault(import('../src/views/tools.vue' /* webpackChunkName: "views/tools" */))
const _394685e1 = () => interopDefault(import('../src/views/tools/export.vue' /* webpackChunkName: "views/tools/export" */))
const _a908f55c = () => interopDefault(import('../src/views/tools/import.vue' /* webpackChunkName: "views/tools/import" */))
const _35a10384 = () => interopDefault(import('../src/views/account/settings.vue' /* webpackChunkName: "views/account/settings" */))
const _0912d934 = () => interopDefault(import('../src/views/account/user.vue' /* webpackChunkName: "views/account/user" */))
const _52d7e326 = () => interopDefault(import('../src/views/categories/create.vue' /* webpackChunkName: "views/categories/create" */))
const _9a6a66bc = () => interopDefault(import('../src/views/plugins/installed.vue' /* webpackChunkName: "views/plugins/installed" */))
const _2b1ac049 = () => interopDefault(import('../src/views/tags/create.vue' /* webpackChunkName: "views/tags/create" */))

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
    component: _8b5ad462,
    name: "404"
  }, {
    path: "/articles",
    component: _07a6e094,
    children: [{
      path: "",
      component: _75bff5b9,
      name: "articles"
    }, {
      path: "create",
      component: _69f30c25,
      name: "articles-create"
    }, {
      path: ":id",
      component: _fbdbdb3e,
      name: "articles-id"
    }]
  }, {
    path: "/categories",
    component: _81588ad0,
    name: "categories"
  }, {
    path: "/dashboard",
    component: _481d182e,
    name: "dashboard"
  }, {
    path: "/login",
    component: _5d61b7c0,
    name: "login"
  }, {
    path: "/medias",
    component: _2e4b75c8,
    children: [{
      path: "",
      component: _aa6af36a,
      name: "medias"
    }, {
      path: "create",
      component: _538ae45a,
      name: "medias-create"
    }]
  }, {
    path: "/pages",
    component: _0cd3daca,
    children: [{
      path: "",
      component: _3c72f8de,
      name: "pages"
    }, {
      path: "create",
      component: _79a06da0,
      name: "pages-create"
    }]
  }, {
    path: "/plugins",
    component: _592899fa,
    name: "plugins"
  }, {
    path: "/settings",
    component: _327b169c,
    name: "settings",
    children: [{
      path: "general",
      component: _38c083f5,
      name: "settings-general"
    }]
  }, {
    path: "/tags",
    component: _e701a5d6,
    name: "tags"
  }, {
    path: "/themes",
    component: _492f51fa,
    children: [{
      path: "",
      component: _c3eb6174,
      name: "themes"
    }, {
      path: "color",
      component: _443ea557,
      name: "themes-color"
    }, {
      path: "customize",
      component: _4192c437,
      name: "themes-customize"
    }, {
      path: "widgets",
      component: _04c9d0ba,
      name: "themes-widgets"
    }]
  }, {
    path: "/tools",
    component: _a7c7ed9c,
    name: "tools",
    children: [{
      path: "export",
      component: _394685e1,
      name: "tools-export"
    }, {
      path: "import",
      component: _a908f55c,
      name: "tools-import"
    }]
  }, {
    path: "/account/settings",
    component: _35a10384,
    name: "account-settings"
  }, {
    path: "/account/user",
    component: _0912d934,
    name: "account-user"
  }, {
    path: "/categories/create",
    component: _52d7e326,
    name: "categories-create"
  }, {
    path: "/plugins/installed",
    component: _9a6a66bc,
    name: "plugins-installed"
  }, {
    path: "/tags/create",
    component: _2b1ac049,
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
