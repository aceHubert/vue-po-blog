import { mixins, Component } from 'nuxt-property-decorator';
import { appMixin, deviceMixin } from '@/mixins';
import { ConfigProvider } from '@/components';
import classes from './styles/blank.less?module';

@Component<BlankLayout>({
  name: 'BlankLayout',
  head() {
    return {
      link: [{ rel: 'stylesheet', href: `/assets/themes/${this.isDark ? 'dark' : 'light'}.css`, hid: 'po-theme' }],
    };
  },
})
export default class BlankLayout extends mixins(appMixin, deviceMixin) {
  render() {
    return (
      <ConfigProvider theme={this.theme} device={this.device} locale={this.antLocale}>
        <nuxt class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]} />
      </ConfigProvider>
    );
  }
}
