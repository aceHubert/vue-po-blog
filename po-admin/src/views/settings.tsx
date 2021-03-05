import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Settings',
  }
}
</router> */
}

@Component({
  name: 'Settings',
})
export default class Settings extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
