import { Vue, Component } from 'nuxt-property-decorator';
{
  /* <router>
{
  path:'/lost-password',
  meta:{
    title: 'Lost Passwrod',
  }
}
</router> */
}

@Component({
  name: 'LostPasswrod',
  layout: 'user',
  meta: {
    anonymous: true,
  },
})
export default class LostPasswrod extends Vue {
  render() {
    return <h1>忘记密码</h1>;
  }
}
