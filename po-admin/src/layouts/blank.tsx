import { mixins, Component } from 'nuxt-property-decorator';
import { AppMixin, DeviceMixin } from '@/mixins';
import { ConfigProvider } from '@/components';
import classes from './styles/blank.less?module';

@Component<BlankLayout>({
  name: 'BlankLayout',
  head() {
    return {
      link: this.isRealDark ? [{ rel: 'stylesheet', href: '/assets/themes/dark.css', hid: 'po-theme' }] : [],
    };
  },
})
export default class BlankLayout extends mixins(AppMixin, DeviceMixin) {
  render() {
    return (
      <ConfigProvider
        theme={this.theme}
        device={this.device}
        i18nRender={(key, fallback) => this.$tv(key, fallback) as string}
        locale={this.antLocale}
      >
        <nuxt class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]} />
      </ConfigProvider>
    );
  }
}
