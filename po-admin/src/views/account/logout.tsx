import { Vue, Component } from 'nuxt-property-decorator';
// import { settingsFuncs } from '@/includes/functions';

import classes from './styles/logout.less?module';

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
  name: 'Logout',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
  beforeRouteEnter(to: Route, from: Route, next: Function) {
    next((vm: Logout) => {
      vm.returnUrl = from.fullPath;
    });
  },
})
export default class Logout extends Vue {
  returnUrl!: string;

  data() {
    return {
      returnUrl: '',
    };
  }

  mounted() {
    this.$store.dispatch('user/logout').then(() => {
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
      <div id="logout" class={classes.wrapper}>
        LogOut...
      </div>
    );
  }
}
