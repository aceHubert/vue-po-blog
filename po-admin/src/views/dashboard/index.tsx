import { Vue, Component } from 'nuxt-property-decorator';
import classes from './styles/index.less?module';

/* <router>
{
  meta:{
    title: 'Dashboard',
  }
}
</router> */

@Component({
  name: 'Dashboard',
})
export default class Dashboard extends Vue {
  render() {
    return (
      <div id="dashboard">
        <div class={classes.banner}>
          <h3 style="margin-top: 1rem">Welcome to Plumemo Blog</h3>
        </div>
      </div>
    );
  }
}
