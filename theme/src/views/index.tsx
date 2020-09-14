import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'home',
  head: {
    title: 'Home',
  },
})
export default class ThemeHome extends Vue {
  params = {
    id: 1,
    text: 'description for home page',
  };

  dynamicComponents = {
    componentA: '/content/plugins/componentA/componentA.umd.js',
    componentB: {
      entry: '/content/plugins/componentB/componentB.umd.js',
      args: {
        desc: '$text',
      },
    },
  };

  render() {
    return (
      <div class="home">
        <router-link to="/post">Post</router-link>
        <plugin-holder support-params={this.params} component-configs={this.dynamicComponents}></plugin-holder>
      </div>
    );
  }
}
