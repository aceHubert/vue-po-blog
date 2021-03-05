import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  path:'/profile',
  meta:{
    title: 'Profile',
  }
}
</router> */
}

@Component({
  name: 'Profile',
})
export default class Profile extends Vue {
  render() {
    return <h1>用户中心</h1>;
  }
}
