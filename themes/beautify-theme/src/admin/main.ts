import { VueConstructor } from 'vue';
import routes from './router';

export default function (this: InstanceType<VueConstructor>, Vue: VueConstructor, opts: any = {}) {
  opts.addRoutes(routes);
}
