import { VueConstructor, Component } from 'vue';
import { print } from '@vue-async/utils';
// import WidgetA from './widgetA';
import WidgetB from './widgetB';

export default function (Vue: VueConstructor, opts: any = {}) {
  print('footer-widget', '加载成功');

  process

  opts.hook('footer_widgets', (widgets: Component[] = []) => {
    return widgets.concat([WidgetB]);
  });
}
