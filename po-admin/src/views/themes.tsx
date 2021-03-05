import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Themes',
  }
}
</router> */
}

@Component({
  name: 'Themes',
})
export default class Themes extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
