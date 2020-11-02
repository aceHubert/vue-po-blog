import { Vue, Component } from 'vue-property-decorator';
import classes from './index.module.scss';

@Component({
  name: 'theme-root-warp',
})
export default class RootWarp extends Vue {
  render() {
    return (
      <div class={classes.container}>
        {this.$slots.default}
        <div class={classes.footer}>
          <p>
            <span>
              <a href="https://github.com/aceHubert/vue-plumemo-blog" target="_blank">
                Theme
              </a>
              &nbsp; by Hubert
            </span>
          </p>
        </div>
      </div>
    );
  }
}
