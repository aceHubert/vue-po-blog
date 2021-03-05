import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Widgets',
  }
}
</router> */
}

@Component({
  name: 'Widgets',
})
export default class Widgets extends Vue {
  render() {
    return <h1>小组件</h1>;
  }
}
