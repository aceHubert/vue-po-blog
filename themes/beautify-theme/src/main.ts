import './class-component-hooks';
import { print } from '@vue-async/utils';

// Routes
import routes from './router';

// Layout components
import { RootWarp, MainWarp, Header, Footer } from './components';

// Vuetiry components
import Vuetify from 'vuetify/lib';
import { Ripple } from 'vuetify/lib/directives';

// Styles
import './assets/styles.scss';

// Types
import { VueConstructor } from 'vue';
import { ModuleContext } from '@plumemo/devtools';
import { ThemeOptions, InitContext, DefaultLayouts } from '@plumemo/devtools/dev-core';

export default function (this: ModuleContext, Vue: VueConstructor, opts: ThemeOptions) {
  print('beautify-theme', '加载成功');

  Vue.use(Vuetify, {
    components: {},
    directives: {
      Ripple,
    },
  });

  // 添加路由
  opts.addRoutes(routes);

  // 注册 init 勾子
  opts.hook('init', ({ app }: InitContext) => {
    app.vuetify = new Vuetify({
      theme: {
        dark: opts.isDarkTheme(),
        themes: opts.getThemes(),
      },
    });
  });

  // 设置布局
  opts.hook('layouts', (layouts: DefaultLayouts) => {
    layouts.rootWarp = RootWarp;
    layouts.mainWarp = MainWarp;
    layouts.header = Header;
    layouts.footer = Footer;
  });
}
