module.exports = {
  publicPath: './',
  productionSourceMap: false,
  lintOnSave: false,
  transpileDependencies: ['vuetify', '@vue-async/utils'],
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    loaderOptions: {
      postcss: {
        path: __dirname,
      },
    },
  },
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
  },
};
