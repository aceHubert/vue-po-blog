import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'theme-about-me',
  head: {
    title: 'About Me',
  },
})
export default class ThemeAboutMe extends Vue {
  render() {
    return (
      <div class="about-me">
        <h1>About Me</h1>
      </div>
    );
  }
}
