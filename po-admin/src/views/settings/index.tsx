import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  redirect:{name:'settings-general'}
}
</router> */
}

// 占位页面
@Component({
  name: 'Settings',
})
export default class Settings extends Vue {
  render() {
    return null;
  }
}
