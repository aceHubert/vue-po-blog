import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'home',
  head() {
    return {
      title: this.$t('home') as string,
    };
  },
})
export default class Home extends Vue {
  render() {
    return (
      <div class="home">
        <p style="text-align:center;padding: 20px;">{this.$t('usage')}</p>
      </div>
    );
  }
}
