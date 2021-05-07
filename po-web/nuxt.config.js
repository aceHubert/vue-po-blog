/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const path = require('path');
const fs = require('fs');

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

// 默认：http://localhost:5008/
const port = process.env.PORT || 5008;
const host = process.env.HOST || 'localhost';
const https = false;

const publicConfig = {
  web_server_port: port,
  server_host: host,
  server_https: https,
  server_url: `http${https ? 's' : ''}://${host}:${port}/`,
};

// 从执行根目录下读取
const configPath = path.resolve(process.cwd(), 'po-config.client.json');
try {
  const options = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  Object.assign(publicConfig, options);
} catch (err) {
  console.log(err.message);
}

module.exports = (configContext) => {
  return {
    vue: {
      config: {
        productionTip: false,
        devtools: configContext.dev,
      },
    },
    server: {
      port: publicConfig.web_server_port,
      host: publicConfig.server_host,
      https: publicConfig.server_https,
    },
    publicRuntimeConfig: Object.assign(
      {},
      publicConfig,
      configContext.dev
        ? {
            // 在dev模式下启用代理解决跨域问题
            server_url: `http${publicConfig.server_https ? 's' : ''}://${publicConfig.server_host}:${
              publicConfig.web_server_port
            }/`,
          }
        : {},
    ),
    privateRuntimeConfig: {},
    ssr: true,
    srcDir: 'src/',
    dir: {
      pages: 'views',
    },
    head: {
      titleTemplate: (title) => (title ? `${title} | Po Blog` : 'Po Blog'),
      meta: [
        { charset: 'utf-8' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Po Blog' },
      ],
      script: [],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      style: [],
    },
    css: ['~/assets/styles/index.scss'],
    loading: '~/components/PageLoading',
    modules: ['@nuxtjs/proxy'],
    proxy: {
      // // 在 devtools 时调试主题模块代理
      // ...(configContext.devProxyThemeTarget
      //   ? {
      //       '/api': {
      //         target: configContext.devProxyThemeTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //       '/graphql': {
      //         target: configContext.devProxyThemeTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //     }
      //   : null),
      // // 在 devtools 时调试插件模块代理
      // ...(configContext.devProxyPluginTarget
      //   ? {
      //       '/api': {
      //         target: configContext.devProxyPluginTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //       '/graphql': {
      //         target: configContext.devProxyPluginTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //     }
      //   : null),
      // 在 dev 模式下启动代理解决跨域问题
      ...(configContext.dev
        ? {
            '/api': {
              target: publicConfig.server_url,
            },
            '/graphql': {
              target: publicConfig.server_url,
            },
          }
        : null),
    },
    plugins: [
      { src: 'plugins/i18n' }, // locale
      { src: 'plugins/pre-init' }, // pre-init
      { src: 'plugins/module-loader', ssr: false }, // modules load
      { src: 'plugins/router' }, // router
    ],
    router: {
      extendRoutes(routes, resolve) {
        routes.push(
          ...[
            {
              path: '/error',
              name: 'error',
              props: true,
              component: resolve(__dirname, './src/layouts/error.tsx'),
            },
            {
              path: '*',
              props: { error: { statusCode: 404 } },
              component: resolve(__dirname, './src/layouts/error.tsx'),
            },
          ],
        );
      },
    },
    buildModules: ['@nuxt/typescript-build'],
    build: {
      babel: {
        // use babel.config.js
        babelrc: true,
        configFile: true,
        cacheDirectory: undefined,
      },
      optimization: {
        splitChunks: {
          chunks: 'async',
        },
      },
      splitChunks: {
        vendor: true,
        commons: true,
        runtime: true,
        pages: false,
        layouts: false,
      },
      transpile: ['@vue-async/module-loader'],
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
    ignore: [
      // 'layouts/root'
    ],
  };
};
