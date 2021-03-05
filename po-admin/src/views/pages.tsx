import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Pages',
  }
}
</router> */
}

@Component({
  name: 'Pages',
})
export default class Pages extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
