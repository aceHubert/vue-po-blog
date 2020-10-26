import { Vue, Component } from 'vue-property-decorator';
import classes from './index.scss?module';

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
        <figure class={classes.logo}></figure>
        <p classes={classes.text}>Loading...</p>
      </div>
    ) : null;
  }
}
