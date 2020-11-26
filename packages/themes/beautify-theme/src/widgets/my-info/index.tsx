import { Vue, Component } from 'vue-property-decorator';
import { VAvatar, VImg } from '@/components/vuetify-tsx';

@Component({
  name: 'widget-my-info',
})
export default class WidgetMyInfo extends Vue {
  counts = {
    post: 0,
    tag: 0,
    category: 0,
  };

  get userInfo() {
    return this.getUserInfo();
  }

  created() {
    Promise.all([this.categoryApi.getCount(), this.tagApi.getCount(), this.articleApi.getCount()]).then(
      ([category, tag, post]) => {
        this.counts = {
          category,
          tag,
          post,
        };
      },
    );
  }

  render() {
    return (
      <div class="my-info text-center">
        <VAvatar size="66" class="mb-2">
          <VImg src={this.userInfo.avatar || require('@/assets/images/avatar1.jpg')} />
        </VAvatar>
        <p class="body-2 mb-2">{this.userInfo.email}</p>
        <div class="d-flex">
          <div style="flex:auto">
            <h1 class="mb-2">{this.counts.post}</h1>
            <p class="mb-0 body-2 grey--text">文章</p>
          </div>
          <div style="flex:auto">
            <h1 class="mb-2">{this.counts.category}</h1>
            <p class="mb-0 body-2 grey--text">分类</p>
          </div>
          <div style="flex:auto">
            <h1 class="mb-2">{this.counts.tag}</h1>
            <p class="mb-0 body-2 grey--text">标签</p>
          </div>
        </div>
      </div>
    );
  }
}
