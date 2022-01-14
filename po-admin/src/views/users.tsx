import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Users',
  }
}
</router> */
}

@Component({
  name: 'Users',
})
export default class Users extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
