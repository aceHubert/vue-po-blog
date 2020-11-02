import { Vue, Component } from 'vue-property-decorator';
import classes from './styles/index.module.scss';

// Types
import { Route } from 'vue-router';

@Component({
  name: 'home',
  head: {
    title: 'Home',
  },
  asyncData({ query, postApi }) {
    const { page = 1 } = query;
    return postApi
      .getList({ page: parseInt(page as string), size: 30, from: 'home' })
      .then((posts: any) => ({ posts }));
  },
})
export default class ThemeHome extends Vue {
  beforeRouteUpdate(to: Route, from: Route, next: Function) {
    const { page = 1 } = to.query;
    this.loading = true;
    this.postApi
      .getList({ page: parseInt(page as string), size: 30, from: 'home' })
      .then((posts: any) => {
        this.posts = posts;
      })
      .finally(() => {
        this.loading = false;
        next();
      });
  }

  loading = false;
  posts = {
    rows: [],
    pager: {
      page: 1,
      size: 10,
      total: 0,
    },
  };
  counts = {
    post: 0,
    tag: 0,
    category: 0,
  };

  get userInfo() {
    return this.getUserInfo();
  }

  get pageLength() {
    const { size, total } = this.posts.pager;
    if (total) {
      return Math.floor(total / size) + (total % size === 0 ? 0 : 1);
    }
    return 0;
  }

  handlePageChange(page: number) {
    this.$router.push({
      query: { ...this.$route.query, page: String(page) },
    });
  }

  created() {
    Promise.all([this.categoryApi.getCount(), this.tagApi.getCount(), this.postApi.getCount()]).then(
      ([category, tag, post]) => {
        this.counts = {
          category,
          tag,
          post,
        };
      },
    );
  }

  renderItem(index: number) {
    const { id, title, thumbnail } = this.posts.rows[index];
    return (
      <nuxt-link to={{ name: 'detail', params: { id } }} class={classes.item}>
        <figure
          class={classes.itemPic}
          style={{ backgroundImage: `url(${thumbnail || 'https://picsum.photos/800/800?random'})` }}
          title={title}
        ></figure>
      </nuxt-link>
    );
  }

  render() {
    const rows = this.posts.rows.length / 3 + (this.posts.rows.length % 3 === 0 ? 0 : 1);

    return (
      <div class={classes.container}>
        <div class={classes.header}>
          <div class={['flex', classes.profile]}>
            <div class={classes.left}>
              <figure class={classes.profilePic}>
                <img src={this.userInfo.avatar} title="profile picture" />
                <label>{this.userInfo.name}</label>
              </figure>
            </div>
            <div class={classes.right}>
              <div class={['flex', classes.numbers]}>
                <div class="flex-auto">
                  <h2 class="number">{this.counts.post}</h2>
                  <p class="title">Posts</p>
                </div>
                <div class="flex-auto">
                  <h2 class="number">0</h2>
                  <p class="title">Likes</p>
                </div>
                <div class="flex-auto">
                  <h2 class="number">{this.counts.tag}</h2>
                  <p class="title">Tags</p>
                </div>
              </div>
            </div>
          </div>
          <p class={classes.description}>
            <small>{this.userInfo.introduction}</small>
          </p>
        </div>
        {Array.from({ length: rows }).map((val1, rowIndex) => (
          <div class={['flex', classes.row]}>
            {Array.from({ length: 3 }).map((val, colIndex) =>
              rowIndex * 3 + colIndex < this.posts.rows.length ? this.renderItem(rowIndex * 3 + colIndex) : null,
            )}
          </div>
        ))}
      </div>
    );
  }
}
