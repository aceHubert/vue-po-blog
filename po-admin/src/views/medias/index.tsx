import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'All Medias',
  }
}
</router>  */
}

@Component({
  name: 'MediaIndex',
})
export default class MediaIndex extends Vue {
  render() {
    return <h1>媒体库</h1>;
  }
}
