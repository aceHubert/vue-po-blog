import { mixins, Component } from 'nuxt-property-decorator';
import { appMixin, deviceMixin } from '@/mixins';
import classes from './styles/user.less?module';

@Component<UserLayout>({
  name: 'UserLayout',
})
export default class UserLayout extends mixins(appMixin, deviceMixin) {
  render() {
    return (
      <div id="layout-user" class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]}>
        <div class={classes.container}>
          <nuxt class={this.device} />
        </div>
        <div class={classes.footer}>
          <div class={classes.links}>
            <a href="_self">帮助</a>
            <a href="_self">隐私</a>
            <a href="_self">条款</a>
          </div>
          <div class={classes.copyright}>Copyright &copy; 2020 Plomemo</div>
        </div>
      </div>
    );
  }
}
