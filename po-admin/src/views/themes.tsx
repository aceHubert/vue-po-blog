import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Themes extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
