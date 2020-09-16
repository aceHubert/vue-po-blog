import { VueConstructor, Component } from 'vue';
import { print } from '@vue-async/utils';
// import WidgetA from './widgetA';
import comment from './components/comment';

export default function (Vue: VueConstructor, opts: any = {}) {
  print('comment-plugin', '加载成功');

  opts.hook('footer_widgets', (widgets: Component[] = []) => {
    return widgets.concat([comment]);
  });
}
