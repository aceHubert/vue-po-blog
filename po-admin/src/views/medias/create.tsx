import { Vue, Component } from 'nuxt-property-decorator';

/* <router>
{
  meta:{
    title: 'New',
  }
}
</router> */

@Component({
  name: 'MediaCreate',
})
export default class MediaCreate extends Vue {
  render() {
    return <h1>新建媒体</h1>;
  }
}
