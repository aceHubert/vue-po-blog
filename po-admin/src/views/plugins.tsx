import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Plugins extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
