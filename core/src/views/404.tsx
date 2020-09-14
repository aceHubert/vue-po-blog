import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'page-not-found',
  head: {
    title: 'Page not found',
  },
})
export default class NotFound extends Vue {
  render(h: any) {
    return <h1 type="red--text">404</h1>;
  }
}
