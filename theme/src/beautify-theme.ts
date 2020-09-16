import { VueConstructor } from 'vue';
import { print } from '@vue-async/utils';
import routes from './router';
import Header from './components/Header';
import Footer from './components/Footer';

import Vuetify, { VApp, VMain } from 'vuetify/lib';
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

  // init
  opts.hook('init', ({ app, addRoutes }: Context) => {
    app.head!.style = (app.head!.link || []).concat([
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

    // routes
    addRoutes(routes);

    app.vuetify = new Vuetify({
      theme: {
        dark: opts.isDark(),
        themes: opts.getThemes(),
      },
    });
  });

  // layout
  opts.hook('layout', (layout: any) => {
    layout.rootWarp = VApp;
    layout.mainWarp = VMain;
    layout.header = Header;
    layout.footer = Footer;
  });
}
