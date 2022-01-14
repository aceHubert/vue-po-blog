import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Settings extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
