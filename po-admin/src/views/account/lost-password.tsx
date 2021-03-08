import { Vue, Component } from 'nuxt-property-decorator';
{
  /* <router>
{
  path:'/lost-password',
  meta:{
    title: 'Site Settings',
  }
}
</router> */
}

@Component({
  name: 'LostPasswrod',
})
export default class LostPasswrod extends Vue {
  render() {
    return <h1>忘记密码</h1>;
  }
}
