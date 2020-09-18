import { Vue, Component, Prop } from 'vue-property-decorator';
import { VContainer } from '@/components/vuetify-tsx';
import {
  VCard,
  VCardTitle,
  VCardSubtitle,
  VCardActions,
  VAvatar,
  VImg,
  VIcon,
  VPagination,
  VProgressCircular,
  VDialog,
  VCardText,
  VSheet,
} from '@/components/vuetify-tsx';
import moment from 'moment';

// Types
import { Route } from 'vue-router';

@Component({
  name: 'theme-search-result',
  head: {
    title: 'Search',
  },
  asyncData({ params, query, postApi }) {
    const { page = 1 } = query;
    const { keywords = '' } = params;
    return postApi.getList({ page, size: 3, keywords, from: 'search' }).then((posts: any) => ({ posts }));
  },
})
export default class ThemeSearchResult extends Vue {
  beforeRouteUpdate(to: Route, from: Route, next: Function) {
    const { page = 1 } = to.query;
    const { keywords = '' } = to.params;
    this.loading = true;
    this.postApi
      .getList({ page, size: 3, keywords, from: 'home' })
      .then((posts: any) => {
        this.posts = posts;
      })
      .finally(() => {
        this.loading = false;
        next();
      });
  }

  @Prop(String) keywords!: string;

  loading = false;
  sidebars = [];
  posts = {
    rows: [],
    pager: {
      page: 1,
      size: 10,
      total: 0,
    },
  };

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

  render() {
    return (
      <VContainer class="search-result">
        <VSheet class="mb-2">
          <p class="mb-0 pa-2 text-center"> Search Result: {this.keywords}</p>
        </VSheet>
        {this.posts.rows && this.posts.rows.length ? (
          [
            this.posts.rows.map(({ id, title, summary, thumbnail, tags = [], views, createTime }) => (
              <VCard min-height="100" class="mb-3" to={{ name: 'theme-article', params: { id } }} nuxt>
                <div class="d-flex flex-no-wrap justify-space-between">
                  <div style="width:100%">
                    {thumbnail ? <VImg src={thumbnail} class="hidden-sm-and-up" aspectRatio="1.7" /> : null}
                    <VCardTitle>{title}</VCardTitle>
                    <VCardSubtitle>
                      {summary}
                      <div>
                        {tags.map((tag: any) => (
                          <nuxt-link to={{ name: 'theme-tag', params: { id: tag.id } }} class="mr-2">
                            {`#${tag.name}`}
                          </nuxt-link>
                        ))}
                      </div>
                    </VCardSubtitle>
                    <VCardActions>
                      <p class="mb-0 caption grey--text">
                        <span>
                          <VIcon size="1.25em" class="mr-1" style="vertical-align: text-bottom; color: inherit;">
                            mdi-eye
                          </VIcon>
                          {views}
                        </span>
                        <span class="ml-2">发布于 {moment(createTime).format('yyyy-MM-DD')}</span>
                      </p>
                    </VCardActions>
                  </div>
                  {thumbnail ? (
                    <div class="hidden-xs-only">
                      <VAvatar class="ma-3" size="125" tile>
                        <VImg src={thumbnail} />
                      </VAvatar>
                    </div>
                  ) : null}
                </div>
              </VCard>
            )),
            this.pageLength ? (
              <VPagination
                v-model={this.posts.pager.page}
                length={this.pageLength}
                totalVisible="7"
                onInput={(val: number) => this.handlePageChange(val)}
              ></VPagination>
            ) : null,
          ]
        ) : (
          <VCard>
            <VCardText class="text-center">
              <VIcon>mdi-information-outline</VIcon>没有搜索到您想要的结果！
            </VCardText>
          </VCard>
        )}
        <VDialog
          v-model={this.loading}
          hideOverlay
          persistent
          noClickAnimation
          width="60px"
          style="box-shadow: none !important;"
        >
          <div style="height:60px">
            <VProgressCircular size="44" indeterminate></VProgressCircular>
          </div>
        </VDialog>
      </VContainer>
    );
  }
}
