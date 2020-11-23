import { VueConstructor } from 'vue';
import routes from './router';

// Types
import { ModuleOptions } from '@plumemo/devtools/dev-admin';

export default function (this: InstanceType<VueConstructor>, Vue: VueConstructor, opts: ModuleOptions) {
  opts.addRoutes(routes);
  opts.addSiderMenus([
    {
      name: 'baidu-seo-config',
      title: 'SEO',
    },
  ]);
}
