import { mixins, Component, Prop } from 'nuxt-property-decorator';
import { appMixin, deviceMixin } from '@/mixins';
import { getMatchedComponents } from '@/utils/router';
import classes from './styles/error.less?module';

// Types
import { NuxtError } from '@nuxt/types';

@Component<ErrorLayout>({
  name: 'ErrorLayout',
  layout: (cxt) => {
    // 获取错误页面嵌套中的最后一个layout
    return getMatchedComponents(cxt.route).reverse()[0].options.layout;
  },
  head() {
    return {
      title: this.message,
    };
  },
})
export default class ErrorLayout extends mixins(appMixin, deviceMixin) {
  @Prop({ type: Object, default: () => ({ statusCode: 500, message: '' }) }) error!: NuxtError;

  get statusCode() {
    return (this.error && this.error.statusCode) || 500;
  }

  get message() {
    return this.error.message || (this.$tv(`error.serverError`, 'An error occurred') as string);
  }

  render() {
    return (
      <div id="error-layout" class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]}>
        <div class={classes.container}>
          <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48">
            <path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" />
          </svg>
          <div class={classes.title}>{this.message}</div>
          {this.statusCode === 404 ? (
            <p class={classes.description}>
              <nuxt-link to="/" class={['primary', classes.btnGoHome]}>
                {this.$tv('error.backToHomeBtnText', 'Back to home')}
              </nuxt-link>
            </p>
          ) : null}
        </div>
      </div>
    );
  }
}
