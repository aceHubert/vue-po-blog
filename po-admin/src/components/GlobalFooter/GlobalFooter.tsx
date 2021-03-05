import { Vue, Component } from 'nuxt-property-decorator';
import classes from './GlobalFooter.less?module';

@Component({
  name: 'GlobalFooter',
})
export default class GlobalFooter extends Vue {
  render() {
    return (
      <div class={classes.footer}>
        <div class={classes.links}>
          <a href="https://github.com/aceHubert/vue-po-blog" target="_blank">
            <a-icon type="github" />
            GitHub
          </a>
          <a href="https://www.byteblogs.com/">byteblogs</a>
        </div>
        <div class={classes.copyright}>
          Copyright
          <a-icon type="copyright" /> 2019-{new Date().getFullYear()} <span> Plumemo</span>
        </div>
      </div>
    );
  }
}
