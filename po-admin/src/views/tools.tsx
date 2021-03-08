import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Tools',
  }
}
</router> */
}

@Component({
  name: 'Tools',
})
export default class Tools extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
