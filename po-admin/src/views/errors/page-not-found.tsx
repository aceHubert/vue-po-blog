import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  path:'/page-not-found',
}
</router> */
}

@Component({
  name: 'PageNotFoundError',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
})
export default class PageNotFoundError extends Vue {
  mounted() {
    this.$nuxt.error({
      statusCode: 404,
      message: this.$tv(`core.error.page_not_found`, 'Page not found!') as string,
    });
  }

  render() {
    return null;
  }
}
