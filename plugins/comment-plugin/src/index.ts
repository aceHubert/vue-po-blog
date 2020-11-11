import { VueConstructor, Component } from 'vue';
import { print } from '@vue-async/utils';
import comment from '@/components/comment';

export default function (Vue: VueConstructor, opts: any = {}) {
  print('comment-plugin', '加载成功');

  opts.hook('page-before', (plugins: Component[] = []) => {
    return plugins.concat([
      Vue.extend({
        render(h: any) {
          return h('div', { style: 'text-align:center' }, 'Page Before Plugin, This will be shown on every pages.');
        },
      }),
    ]);
  });

  opts.hook('page-after', (plugins: Component[] = []) => {
    return plugins.concat([
      Vue.extend({
        render(h: any) {
          return h('div', { style: 'text-align:center' }, 'Page After Plugin, This will be shown on every pages.');
        },
      }),
    ]);
  });

  opts.hook('article-after', (plugins: Component[] = []) => {
    return plugins.concat([comment]);
  });

  opts.hook('article-sidebar', (plugins: Component[] = []) => {
    return plugins.concat([
      Vue.extend({
        render(h: any) {
          return h('div', 'Sidebar Plugin');
        },
      }),
    ]);
  });
}
