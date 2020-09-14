import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'home',
  head: {
    title: 'Home',
  },
})
export default class Home extends Vue {
  render() {
    return (
      <div class="home">
        <p style="text-align:center;padding: 20px;">请在主题文件中配置主页</p>
      </div>
    );
  }
}
