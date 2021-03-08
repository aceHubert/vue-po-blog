import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Menu',
  }
}
</router> */
}

@Component({
  name: 'ThemeMenu',
})
export default class ThemeMenu extends Vue {
  render() {
    return <h1>菜单</h1>;
  }
}
