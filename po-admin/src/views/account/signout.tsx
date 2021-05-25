import { Vue, Component } from 'nuxt-property-decorator';
import { userStore } from '@/store/modules';
// import { settingsFuncs } from '@/includes/functions';

import classes from './styles/signout.less?module';

// Types
import { Route } from 'vue-router';

{
  /* <router>
{
  path: '/logout'
}
</router> */
}

@Component({
  name: 'SignOut',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
  beforeRouteEnter(to: Route, from: Route, next: Function) {
    next((vm: SignOut) => {
      vm.returnUrl = from.fullPath;
    });
  },
})
export default class SignOut extends Vue {
  returnUrl!: string;

  data() {
    return {
      returnUrl: '',
    };
  }

  mounted() {
    userStore.signout().then(() => {
      // open new page
      // let returnUrl = this.returnUrl;
      // if (!returnUrl && process.client) {
      //   returnUrl = window.location.href;
      // }
      // window.location.href = settingsFuncs.getBaseUrl() + settingsFuncs.getBasePath() + `login?rutnrnUrl=${returnUrl}`;

      this.$router.replace(`/login?returnUrl=${this.returnUrl}`);
    });
  }

  render() {
    return (
      <div id="signout" class={classes.wrapper}>
        {this.$tv('core.common.tips.signout', 'Sign Out...')}
      </div>
    );
  }
}
