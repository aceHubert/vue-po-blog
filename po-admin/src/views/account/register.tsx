import { Vue, Component } from 'nuxt-property-decorator';
{
  /* <router>
{
  path:'/register',
  meta:{
    title: 'Register',
  }
}
</router> */
}

@Component({
  name: 'Register',
  layout: 'user',
  meta: {
    anonymous: true,
  },
})
export default class Register extends Vue {
  render() {
    return <h1>注册</h1>;
  }
}
