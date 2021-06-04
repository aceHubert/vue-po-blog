import { mixins, Component } from 'nuxt-property-decorator';
import { appMixin, deviceMixin } from '@/mixins';
import { ConfigProvider, GlobalFooter } from '@/components';
import classes from './styles/user.less?module';

@Component<UserLayout>({
  name: 'UserLayout',
  head() {
    return {
      link: [{ rel: 'stylesheet', href: `/assets/themes/${this.isDark ? 'dark' : 'light'}.css`, hid: 'po-theme' }],
    };
  },
})
export default class UserLayout extends mixins(appMixin, deviceMixin) {
  render() {
    return (
      <ConfigProvider theme={this.theme} device={this.device} locale={this.antLocale}>
        <div id="layout-user" class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]}>
          <div class={classes.container}>
            <nuxt class={this.device} />
          </div>
          <GlobalFooter class={classes.footer}>
            <template slot="links">
              <a href="_self">帮助</a>
              <a href="_self">隐私</a>
              <a href="_self">条款</a>
            </template>
          </GlobalFooter>
        </div>
      </ConfigProvider>
    );
  }
}
