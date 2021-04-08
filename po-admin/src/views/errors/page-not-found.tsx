import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  path:'/page-not-found',
}
</router> */
}

@Component({
  name: 'ErrorPageNotFound',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
})
export default class ErrorPageNotFound extends Vue {
  mounted() {
    this.$nuxt.error({
      statusCode: 404,
      message: this.$tv(`error.pageNotFound`, 'Page not found!') as string,
    });
  }

  render() {
    return null;
  }
}
