import { mixins, Component } from 'nuxt-property-decorator';
import { AppMixin, DeviceMixin } from '@/mixins';
import { ConfigProvider } from '@/components';
import classes from './styles/blank.less?module';

@Component<BlankLayout>({
  name: 'BlankLayout',
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
