import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'BaiduSeoConfig',
  head: {
    title: '百度SEO',
  },
})
export default class BaiduSeoConfig extends Vue {
  value = 1;

  render() {
    return <h1>setting</h1>;
  }
}
