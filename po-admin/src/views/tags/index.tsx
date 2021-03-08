import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Tags'
  }
}
</router> */
}

@Component({
  name: 'Tags',
})
export default class Tags extends Vue {
  render() {
    return <h1>标签</h1>;
  }
}
