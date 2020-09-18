import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'page-not-found',
  layout: 'root/index',
  head: {
    title: 'Page not found',
  },
})
export default class NotFound extends Vue {
  render(h: any) {
    return (
      <div class="page-not-found" style="text-align: center;">
        <div style="margin: auto;padding: 10% 0 15px;color: rgb(238, 238, 238);width: 600px;max-width: 100%;">
          <h1 style="font-size: 120px;margin:0;">404</h1>
          <h3 style="font-size: 32px;margin:0;">PAGE NOT FOUND</h3>
        </div>
        <a href={process.env.BASE_URL || '/'}>GO TO HOME</a>
      </div>
    );
  }
}
