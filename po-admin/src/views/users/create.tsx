import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'New',
  }
}
</router> */
}

@Component({
  name: 'UserCreate',
})
export default class UserCreate extends Vue {
  render() {
    return <h1>创建用户</h1>;
  }
}
