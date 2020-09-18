import './class-component-hooks';
import { VueConstructor } from 'vue';
import { print } from '@vue-async/utils';

// Routes
import routes from './router';

// Layout components
import RootWarp from './components/root-warp';
import Header from './components/header';
import Footer from './components/footer';

// Vuetiry components
import Vuetify, { VMain } from 'vuetify/lib';
import { Ripple } from 'vuetify/lib/directives';

// Types
import { Context } from '@nuxt/types';

export default function (Vue: VueConstructor, opts: any = {}) {
  print('beautify-theme', '加载成功');

  Vue.use(Vuetify, {
    components: {},
    directives: {
      Ripple,
    },
  });

  // 添加路由
  opts.addRoutes(routes);

  // 使用黑色主题
  opts.setDark(true);

  // 注册 init 勾子
  opts.hook('init', ({ app }: Context) => {
    app.head!.link = (app.head!.link || []).concat([
      {
        rel: 'stylesheet',
        href: '//fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900',
        'data-style-for': 'beautify-theme',
      },
      {
        rel: 'stylesheet',
        href: '//cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css',
        'data-style-for': 'beautify-theme',
      },
    ]);

    app.vuetify = new Vuetify({
      theme: {
        dark: opts.isDark(),
        themes: opts.getThemes(),
      },
    });
  });

  // 设置布局
  opts.hook('layout', (layout: any) => {
    layout.rootWarp = RootWarp;
    layout.mainWarp = VMain;
    layout.header = Header;
    layout.footer = Footer;
  });
}
