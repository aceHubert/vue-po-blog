import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  redirect:{name:'tools-import'}
}
</router> */
}

// 占位页面
@Component({
  name: 'Tools',
})
export default class Tools extends Vue {
  render() {
    return null;
  }
}
