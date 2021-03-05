import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Categories'
  }
}
</router> */
}

@Component({
  name: 'Categories',
})
export default class Categories extends Vue {
  render() {
    return <h1>分类</h1>;
  }
}
