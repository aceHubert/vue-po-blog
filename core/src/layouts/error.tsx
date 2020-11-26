import { Vue, Component, Prop } from 'vue-property-decorator';
import classes from './styles/error.scss?module';

// Types
type Error = {
  statusCode: number;
  message: string;
};

@Component<PageError>({
  name: 'page-error',
  head() {
    return {
      title: this.message,
    };
  },
})
export default class PageError extends Vue {
  @Prop(Object) error!: Error;

  get message() {
    return this.error.statusCode === 404 ? 'Page not found' : this.error.message || 'An error occurred';
  }

  render() {
    return (
      <div class={['error-page', classes.container]}>
        <h1 clsss={classes.errorText}>{this.message}</h1>
        <nuxt-link to="/" class={['primary', classes.btnGoHome]}>
          {this.$t('home')}
        </nuxt-link>
      </div>
    );
  }
}
