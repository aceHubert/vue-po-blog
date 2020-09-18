import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'theme-archive',
  head: {
    title: 'Archive',
  },
})
export default class ThemeArchive extends Vue {
  render() {
    return (
      <div class="archive">
        <h1>Archive</h1>
      </div>
    );
  }
}
