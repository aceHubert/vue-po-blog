import { mixins, Component } from 'nuxt-property-decorator';
import { appMixin, deviceMixin } from '@/mixins';
import classes from './styles/blank.less?module';

@Component<BlankLayout>({
  name: 'BlankLayout',
})
export default class BlankLayout extends mixins(appMixin, deviceMixin) {
  render() {
    return <nuxt class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]} />;
  }
}
