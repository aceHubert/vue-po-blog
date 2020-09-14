import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'theme-setting',
  head: {
    title: 'Setting',
  },
})
export default class ThemeSetting extends Vue {
  render() {
    return (
      <div class="setting">
        <h1>setting</h1>
      </div>
    );
  }
}
