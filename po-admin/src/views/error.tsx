import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  alias:[
    '/404',
    '/page-not-found',
    '/401',
    '/unauthorized'
  ],
  props:true,
}
</router> */
}

@Component({
  name: 'ErrorPage',
  layout: 'blank',
})
export default class ErrorPage extends Vue {
  mounted() {
    let statusCode = 500;
    if (this.$route.path === '/401' || this.$route.path === '/unauthorized') {
      statusCode = 401;
    } else if (this.$route.path === '/404' || this.$route.path === '/page-not-found') {
      statusCode = 404;
    }
    this.$nuxt.error({
      statusCode,
      message: `error.${(this.$route.query.code as string) || statusCode}`,
    });
  }

  render() {
    return null;
  }
}
