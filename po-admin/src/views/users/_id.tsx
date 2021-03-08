import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  name:'users-edit',
  meta:{
    title: 'Edit',
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
