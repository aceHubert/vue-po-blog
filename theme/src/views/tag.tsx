import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'theme-tag',
  head: {
    title: 'Tag',
  },
})
export default class ThemeTag extends Vue {
  render() {
    return (
      <div class="tag">
        <h1>Tag</h1>
      </div>
    );
  }
}
