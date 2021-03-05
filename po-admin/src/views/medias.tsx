import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Medias',
  }
}
</router> */
}

@Component({
  name: 'Medias',
})
export default class Medias extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
