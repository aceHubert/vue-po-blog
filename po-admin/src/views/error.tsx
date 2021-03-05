import { Vue, Component, Prop } from 'nuxt-property-decorator';

{
  /* <router>
{
  alias:[
    '/404',
    '/page-not-found'
  ]
}
</router> */
}

@Component({
  name: 'ErrorPage',
  layout: 'blank',
})
export default class ErrorPage extends Vue {
  @Prop(Number) statusCode!: number;
  @Prop(String) message!: string;

  mounted() {
    let statusCode = this.statusCode || 500;
    if (this.$route.path === '/404' || this.$route.path === '/page-not-found') {
      statusCode = 404;
    }
    this.$nuxt.error({
      statusCode,
      message: this.message || (this.$tv(`error.${statusCode}`, 'An error occurred') as string),
    });
  }

  render() {
    return null;
  }
}
