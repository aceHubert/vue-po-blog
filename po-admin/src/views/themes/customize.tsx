import { Vue, Component } from 'nuxt-property-decorator';

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
})
export default class ThemeCustomize extends Vue {
  render() {
    return <h1>主题自定义</h1>;
  }
}
