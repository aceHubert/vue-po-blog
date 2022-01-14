import { Component } from 'nuxt-property-decorator';
import NestedLayoutMixin from '@/mixins/nested-layout';

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
export default class Posts extends NestedLayoutMixin {
  render() {
    return <nuxt-child />;
  }
}
