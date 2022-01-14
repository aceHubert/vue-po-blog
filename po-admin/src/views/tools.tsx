import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Tools extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
