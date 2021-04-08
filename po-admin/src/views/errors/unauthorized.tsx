import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  path:'/unauthorized'
}
</router> */
}

@Component({
  name: 'ErrorUnauthorized',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
})
export default class ErrorUnauthorized extends Vue {
  mounted() {
    this.$nuxt.error({
      statusCode: 401,
      message: this.$tv(`error.unauthorized`, 'No permissions to visit this site!') as string,
    });
  }

  render() {
    return null;
  }
}
