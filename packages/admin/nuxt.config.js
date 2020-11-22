/* eslint-disable prettier/prettier */

const isProd = process.env.NOEW_ENV === 'production';

// eslint-disable-next-line no-unused-vars
const assetsCDN = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    'vue-i18n': 'VueI18n',
    'vue-meta': 'VueMeta',
  },
  css: [
    // { href: '//cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css', prefetch: true },
  ],
  js: [
    { src: '//cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js', preload: true },
    { src: '//cdn.jsdelivr.net/npm/vue-router@3.3.4/dist/vue-router.min.js', preload: true },
    { src: '//cdn.jsdelivr.net/npm/vuex@3.5.1/dist/vuex.min.js', preload: true },
    { src: '//cdn.jsdelivr.net/npm/vue-i18n@8.20.0/dist/vue-i18n.min.js', preload: true },
    { src: '//cdn.jsdelivr.net/npm/vue-meta@2.4.0/dist/vue-meta.min.js', preload: true },
  ],
};

const port = process.env.PORT || 5009;
const host = process.env.HOST || 'localhost';

module.exports = (configContext) => {
  return {
    vue: {
      config: {
        productionTip: false,
        devtools: !isProd,
      },
    },
    server: {
      port, // default: 3000
      host, // default: localhost,
      https: false,
    },
    env: {
      // axios baseUrl (服务端 axios 请求时必须有前缀)
      baseUrl: process.env.BASE_URL || `http://${host}:${port}`,
    },
    ssr: false,
    srcDir: 'src/',
    dir: {
      pages: 'views',
    },
    head: {
      titleTemplate: (title) => (title ? `${title} | Plumemo Admin` : 'Plumemo Admin'),
      meta: [
        { charset: 'utf-8' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Plumemo Blog' },
      ],
      script: [],
      link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }],
      style: [],
    },
    css: ['~/assets/styles/index.less'],
    modules: ['@nuxtjs/proxy'],
    proxy: {
      // 在 devtools 时调试模块代理
      ...(configContext.proxyThemeTarget
        ? {
            '/api/blog/module/theme/v1/get': {
              target: configContext.proxyThemeTarget,
              changeOrigin: false,
              ws: false,
              pathRewrite: {
                '^/api/blog/module/theme/v1/get': '',
              },
            },
          }
        : null),
      ...(configContext.proxyPluginTarget
        ? {
            '/api/blog/module/plugin/v1/list': {
              target: configContext.proxyPluginTarget,
              changeOrigin: false,
              ws: false,
              pathRewrite: {
                '^/api/blog/module/plugin/v1/list': '',
              },
            },
          }
        : null),
      // 在 dev 或 devtools 模式下接口代理
      ...(configContext.dev || configContext.devtools
        ? {
            '/api/blog': {
              target: 'http://preview2.plumemo.com',
            },
          }
        : null),
    },
    plugins: [
      // 第三方模块分开引用（部分第三方模块不支持服务端渲染）
      { src: 'plugins/vue-antd' },
      { src: 'plugins/vue-ls' },
      { src: 'plugins/vue-cropper', ssr: false },
      { src: 'plugins/vue-clipboard' },
      { src: 'plugins/vue-viser' },
      // 第三方模块加载完成
      { src: 'plugins/pre-init' }, // pre-init
      { src: 'plugins/module-loader', ssr: false }, // modules load
      { src: 'plugins/i18n' }, // locale
      { src: 'plugins/router' }, // router
    ],
    router: {
      middleware: 'auth',
      extendRoutes(routes, _resolve) {
        routes.push(
          {
            path: '/',
            redirect: { name: 'dashboard' },
          },
          {
            path: '*',
            redirect: { name: '404' },
          },
        );
      },
    },
    buildModules: ['@nuxt/typescript-build', '@nuxtjs/svg'],
    build: {
      babel: {
        // use babel.config.js
        babelrc: true,
        configFile: true,
        cacheDirectory: undefined,
      },
      transpile: ['@vue-async/utils', '@vue-async/module-loader'],
      extractCSS: true,
      loaders: {
        less: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: {
              hack: 'true;@import "./src/assets/styles/fn.less"',
            },
          },
        },
        cssModules: {
          modules: {
            localIdentName: isProd ? '[hash:base64]' : '[path]_[name]_[local]_[hash:base64:5]',
          },
          localsConvention: 'camelCaseOnly',
        },
      },
      /*
       ** You can extend webpack config here
       */
      // eslint-disable-next-line no-unused-vars
      extend(config, ctx) {},
    },
    // 启动加载 loading 配置
    loadingIndicator: {
      name: 'three-bounce',
      color: '#f67280',
      background: 'white',
    },
    // 忽略文件的 auto build
    ignore: ['views/*/modules/*.vue', 'views/*/constants.ts'],
  };
};
