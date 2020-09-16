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

module.exports = {
  vue: {
    config: {
      productionTip: false,
      devtools: !isProd,
    },
  },
  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0', // default: localhost,
    https: false,
  },
  mode: 'spa',
  srcDir: 'src/',
  dir: {
    pages: 'views',
  },
  css: [
    // '//fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900',
    // '//cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css',
  ],
  head: {
    titleTemplate: title => (title ? `${title} | Plumemo` : 'Plumemo'),
    meta: [
      { charset: 'utf-8' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Plumemo Blog' },
    ],
    script: [],
    link: [],
  },
  modules: ['@nuxtjs/proxy'],
  proxy: {
    // 设置代理
    // proxy all requests starting with /api to jsonplaceholder
    '/content/theme': {
      // target: "https://emm.cmccbigdata.com:8443/",
      target: 'http://localhost:8081/',
      // target: "http://47.106.136.114/",
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/content/theme': '',
      },
    },
    '/content/plugins': {
      target: 'http://localhost:8082/',
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/content/plugins': '',
      },
    },
    '/api/blog': {
      target: 'https://preview.plumemo.com',
    },
  },
  plugins: [
    { src: 'plugins/pre-init' }, // pre-init
    { src: 'plugins/i18n' }, // locale
    { src: 'plugins/router' }, // router
    { src: 'plugins/module-loader', mode: 'client' },
  ],
  router: {
    extendRoutes(routes, _resolve) {
      routes.push({
        path: '*',
        redirect: { name: '404' },
      });
    },
  },
  babel: {
    babelrc: true,
    cacheDirectory: undefined,
  },
  buildModules: ['@nuxt/typescript-build'],
  build: {
    extractCSS: true,
    loaders: {
      scss: {
        // implementation: require('sass'),
        // fiber: require('fibers'),
        data: `
        @import "./src/assets/styles/variables.scss";
        `,
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
};
