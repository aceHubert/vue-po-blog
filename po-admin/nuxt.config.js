/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const path = require('path');
const fs = require('fs');

// 默认：http://localhost:5009/
const port = process.env.PORT || 5009;
const host = process.env.HOST || 'localhost';
const https = false;

const publicConfig = {
  admin_server_port: port,
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
      port: publicConfig.admin_server_port,
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
              publicConfig.admin_server_port
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
      titleTemplate: (title) => (title ? `${title} | Po Admin` : 'Po Admin'),
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
    css: ['~/assets/styles/index.less'],
    modules: ['@nuxtjs/proxy'],
    proxy: {
      // // 在 devtools 时调试后台模块代理
      // ...(configContext.devProxyModuleTarget
      //   ? {
      //       '/api': {
      //         target: configContext.devProxyModuleTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //       '/graphql': {
      //         target: configContext.devProxyModuleTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //     }
      //   : null),
      // // 在 devtools 模式下接口代理
      // ...(configContext.devProxyApiTarget
      //   ? {
      //       '/api': {
      //         target: configContext.devProxyApiTarget,
      //         changeOrigin: false,
      //         ws: false,
      //       },
      //       '/graphql': {
      //         target: configContext.devProxyApiTarget,
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
      { src: 'plugins/vue-antd' },
      { src: 'plugins/vue-ls', ssr: false },
      { src: 'plugins/vue-ckeditor', ssr: false },
      { src: 'plugins/bootstrap' },
    ],
    router: {
      base: '/admin/',
      middleware: 'auth',
      extendRoutes(routes, _resolve) {
        routes.push(
          {
            path: '/',
            name: 'home',
            redirect: { name: 'dashboard' },
          },
          {
            path: '*',
            redirect: { path: '/page-not-found' },
          },
        );
      },
    },
    buildModules: ['@nuxt/typescript-build', '@nuxtjs/svg', '@nuxtjs/router-extras'],
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
      transpile: [
        'lodash-es',
        'vue-tsx-support',
        'ant-design-vue',
        '@ant-design-vue/pro-layout',
        '@vue-async/module-loader',
        '@vue-async/utils',
      ],
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
            localIdentName: configContext.dev ? '[hash:base64]' : '[path]_[name]_[local]_[hash:base64:5]',
          },
          localsConvention: 'camelCaseOnly',
        },
      },
      /*
       ** You can extend webpack config here
       */
      extend(config, ctx) {
        if (ctx.isClient) {
          // https://github.com/webpack/webpack/issues/5423
          config.node = Object.assign({}, config.node, {
            fs: 'empty',
            path: 'empty',
            module: 'empty',
          });
        }
      },
    },
    // 启动加载 loading 配置
    loadingIndicator: {
      name: 'three-bounce',
      color: '#f67280',
      background: 'white',
    },
    // 忽略文件的 auto build
    ignore: ['views/*/styles/**/*', 'views/*/modules/**/*'],
  };
};
