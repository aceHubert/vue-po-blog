import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Installed Plugins',
  }
}
</router> */
}

@Component({
  name: 'InstalledPlugins',
})
export default class InstalledPlugins extends Vue {
  render() {
    return <h1>已安装插件</h1>;
  }
}
