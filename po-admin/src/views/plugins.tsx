import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

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
export default class Plugins extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
