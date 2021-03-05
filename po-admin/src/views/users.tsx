import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

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
export default class Users extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
