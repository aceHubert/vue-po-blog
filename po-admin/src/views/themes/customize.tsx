import { Vue, Component } from 'nuxt-property-decorator';
import { UserCapability } from '@/includes/datas';
{
  /* <router>
{
  meta:{
    title: 'Theme Customize',
  }
}
</router> */
}

@Component({
  name: 'ThemeCustomize',
  layout: 'blank',
  meta: {
    capabilities: [UserCapability.Customize],
  },
})
export default class ThemeCustomize extends Vue {
  render() {
    return <h1>主题自定义</h1>;
  }
}
