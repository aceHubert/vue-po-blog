import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'theme-post',
  head: {
    title: 'Post',
  },
})
export default class ThemePost extends Vue {
  render() {
    return (
      <div class="post">
        <h1>Post</h1>
      </div>
    );
  }
}
