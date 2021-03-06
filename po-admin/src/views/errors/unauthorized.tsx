import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  path:'/unauthorized'
}
</router> */
}

@Component({
  name: 'UnauthorizedError',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
})
export default class UnauthorizedError extends Vue {
  mounted() {
    this.$nuxt.error({
      statusCode: 401,
      message: this.$tv(`core.error.unauthorized`, 'No permissions to visit this site!') as string,
    });
  }

  render() {
    return null;
  }
}
