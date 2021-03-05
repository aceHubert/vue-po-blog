import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Theme Libs',
  }
}
</router> */
}

@Component({
  name: 'ThemeLibs',
})
export default class ThemeLibs extends Vue {
  render() {
    return <h1>安装的主题库</h1>;
  }
}
