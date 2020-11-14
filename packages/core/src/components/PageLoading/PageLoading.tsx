import { Vue, Component } from 'vue-property-decorator';
import classes from './PageLoading.scss?module';

@Component({
  name: 'page-loading',
})
export default class PageLoading extends Vue {
  loading = false;

  start() {
    this.loading = true;
  }

  finish() {
    this.loading = false;
  }

  render() {
    return this.loading ? (
      <div class={classes.container}>
        <div class={classes.content}>
          <figure class={classes.logo}></figure>
          <p classes={classes.text}>Loading...</p>
        </div>
      </div>
    ) : null;
  }
}
