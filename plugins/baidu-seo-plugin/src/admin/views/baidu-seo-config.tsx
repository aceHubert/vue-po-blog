import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'BaiduSeoConfig',
  head: {
    title: '百度SEO',
  },
})
export default class BaiduSeoConfig extends Vue {
  render() {
    return (
      <div class="setting">
        <h1>setting</h1>
      </div>
    );
  }
}
