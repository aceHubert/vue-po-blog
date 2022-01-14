import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Medias extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
