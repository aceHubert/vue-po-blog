import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'General Settings',
  }
}
</router> */
}

@Component({
  name: 'SettingsGeneral',
})
export default class SettingsGeneral extends Vue {
  render() {
    return <h1>常规设置</h1>;
  }
}
