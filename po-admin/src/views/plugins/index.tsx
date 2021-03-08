import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Plugins',
  }
}
</router> */
}

@Component({
  name: 'Plugins',
})
export default class Plugins extends Vue {
  render() {
    return <h1>插件</h1>;
  }
}
