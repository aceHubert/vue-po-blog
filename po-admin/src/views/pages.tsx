import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Pages extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
