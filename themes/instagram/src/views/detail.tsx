import { Vue, Component } from 'vue-property-decorator';
import classes from './styles/detail.module.scss';
import { error } from '@vue-async/utils';

// Types
import { Post } from '@plumemo/devtools/dev-core';

@Component<ThemeDetail>({
  name: 'detail',
  head() {
    return {
      title: this.post ? this.post.title : 'Detail',
    };
  },
  asyncData({ params, postApi }) {
    const { id } = params;
    return postApi
      .get(parseInt(id))
      .then((post: any) => ({ post }))
      .catch((err) => {
        error(process.env.NODE_ENV === 'production', err.message);
      });
  },
})
export default class ThemeDetail extends Vue {
  post: Post | null = null;

  get userInfo() {
    return this.getUserInfo();
  }

  render() {
    return this.post ? (
      <div class={classes.container}>
        <div class={classes.title}>
          <figure class={classes.profilePic}>
            <img src={this.userInfo.avatar} title="profile picture" />
            <label>{this.userInfo.name}</label>
          </figure>
        </div>
        <div class={classes.content}>
          <figure class={classes.img}>
            <img src={this.post.thumbnail || 'https://picsum.photos/800/800?random'} title={this.post.title} />
          </figure>
          <div class={classes.actions}>
            <a href="javascript:;" title="Like">
              <i class="iconfont icon-like"></i>
            </a>
            <a href="javascript:;" title="Comment">
              <i class="iconfont icon-comment"></i>
            </a>
            <a href="javascript:;" title="Share">
              <i class="iconfont icon-share"></i>
            </a>
          </div>
          <p class={classes.description}>
            <span class={classes.name}>{this.userInfo.name}:</span>
            {this.post.summary}
          </p>
        </div>
      </div>
    ) : (
      <p class={['error--text', classes.error]}>The post isn't exists!!!</p>
    );
  }
}
