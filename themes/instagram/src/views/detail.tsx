import { Vue, Component } from 'vue-property-decorator';
import classes from './styles/detail.module.scss';
import { error } from '@vue-async/utils';

// Types
import { Article } from '@plumemo/devtools/dev-core';

@Component<ThemeDetail>({
  name: 'detail',
  head() {
    return {
      title: this.article ? this.article.title : 'Detail',
    };
  },
  asyncData({ params, articleApi }) {
    const { id } = params;
    return articleApi
      .get(parseInt(id))
      .then((article: Article) => ({ article }))
      .catch((err: Error) => {
        error(process.env.NODE_ENV === 'production', err.message);
      });
  },
})
export default class ThemeDetail extends Vue {
  article: Article | null = null;

  get userInfo() {
    return this.getUserInfo();
  }

  render() {
    return this.article ? (
      <div class={classes.container}>
        <div class={classes.title}>
          <figure class={classes.profilePic}>
            <img src={this.userInfo.avatar} title="profile picture" />
            <label>{this.userInfo.name}</label>
          </figure>
        </div>
        <div class={classes.content}>
          <figure class={classes.img}>
            <img src={this.article.thumbnail || 'https://picsum.photos/800/800?random'} title={this.article.title} />
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
            {this.article.summary}
          </p>
        </div>
      </div>
    ) : (
      <p class={['error--text', classes.error]}>The post isn't exists!!!</p>
    );
  }
}
