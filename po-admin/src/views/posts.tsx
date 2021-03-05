import { Component } from 'nuxt-property-decorator';
import VueNestedLayout from '@/utils/vue-nested-layout';

{
  /* <router>
{
  meta:{
    title: 'Posts',
  }
}
</router> */
}

@Component({
  name: 'Posts',
})
export default class Posts extends VueNestedLayout {
  render() {
    return <nuxt-child />;
  }
}
