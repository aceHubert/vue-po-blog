import { Vue, Component } from 'nuxt-property-decorator';
{
  /* <router>
{
  path:'/settings',
  meta:{
    title: 'Site Settings',
  }
}
</router> */
}

@Component({
  name: 'SiteSettings',
})
export default class SiteSettings extends Vue {
  render() {
    return <h1>站点配置</h1>;
  }
}
