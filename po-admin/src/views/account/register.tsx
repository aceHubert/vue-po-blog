import { Vue, Component } from 'nuxt-property-decorator';
{
  /* <router>
{
  path:'/register',
  meta:{
    title: 'Site Settings',
  }
}
</router> */
}

@Component({
  name: 'Register',
})
export default class Register extends Vue {
  render() {
    return <h1>注册</h1>;
  }
}
