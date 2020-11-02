import './class-component-hooks';
import { print } from '@vue-async/utils';

// Styles
import './assets/styles/index.scss';

// Routes
import routes from './router';

// Layout components
import RootWarp from './components/root-warp';

// Types
import { VueConstructor } from 'vue';
import { ModuleContext } from '@plumemo/devtools';
import { ThemeOptions, DefaultLayouts } from '@plumemo/devtools/dev-core';

export default function (this: ModuleContext, Vue: VueConstructor, opts: ThemeOptions) {
  print('instagram', '加载成功');

  // 添加路由
  opts.addRoutes(routes);

  // 使用亮色主题(强制使用亮色主题，并使其它插件生效)
  opts.setDarkTheme(false);

  // 修改 title 模板
  opts.hook('head_title_template', () => {
    return (title: string) => `${title} | Hubert's Homepage`;
  });

  // 注册 init 勾子
  // opts.hook('init', ({ app }: InitContext) => {
  //   // do something
  // });

  // 设置布局
  opts.hook(
    'layouts',
    (layouts: DefaultLayouts, layoutName: string) => {
      print('layout name', layoutName);

      layouts.rootWarp = RootWarp;
    },
    10,
    2,
  );
}
