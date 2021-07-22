import { mixins, Component } from 'nuxt-property-decorator';
import { AppMixin, DeviceMixin } from '@/mixins';
import { ConfigProvider } from '@/components';
import { GlobalFooter } from './modules';
import classes from './styles/user.less?module';

@Component<UserLayout>({
  name: 'UserLayout',
  head() {
    return {
      link: this.isRealDark ? [{ rel: 'stylesheet', href: '/assets/themes/dark.css', hid: 'po-theme' }] : [],
    };
  },
})
export default class UserLayout extends mixins(AppMixin, DeviceMixin) {
  render() {
    return (
      <ConfigProvider
        theme={this.theme}
        device={this.device}
        i18nRender={(key, fallback) => this.$tv(key, fallback) as string}
        locale={this.antLocale}
      >
        <div id="layout-user" class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]}>
          <div class={classes.container}>
            <nuxt class={this.device} />
          </div>
          <GlobalFooter class={classes.footer}>
            <template slot="links">
              <a href="_self" class="grey--text text--lighten2">
                {this.$tv('core.layout.user.help', 'Help')}
              </a>
              <a href="_self" class="grey--text text--lighten2">
                {this.$tv('core.layout.user.privacy', 'Privacy')}
              </a>
              <a href="_self" class="grey--text text--lighten2">
                {this.$tv('core.layout.user.terms', 'Terms')}
              </a>
            </template>
          </GlobalFooter>
        </div>
      </ConfigProvider>
    );
  }
}
