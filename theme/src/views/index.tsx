import { Vue, Component } from 'vue-property-decorator';
import { VContainer, VRow, VCol, VCard, VCardTitle, VCardSubtitle, VAvatar, VImg } from '@/components/vuetify-tsx';

@Component({
  name: 'home',
  head: {
    title: 'Home',
  },
  asyncData({ post }) {
    return post.getList().then((posts: any) => ({ posts }));
  },
})
export default class ThemeHome extends Vue {
  sidebars = [];
  posts = {
    rows: [],
    pager: {},
  };

  get supportParams() {
    return {};
  }

  render() {
    return (
      <VContainer class="home">
        <VRow>
          <VCol cols="8">
            {this.posts.rows.map(({ title, summary, thumbnail, author, tags = [] }) => (
              <VCard min-height="149" class="mb-3">
                <div class="d-flex flex-no-wrap justify-space-between">
                  <div>
                    <VCardTitle class="flex-column align-start">
                      {title}
                      <p class="caption mb-0 grey--text">{author}</p>
                    </VCardTitle>
                    <VCardSubtitle>
                      {summary}
                      <div>
                        {tags.map((tag: any) => (
                          <nuxt-link to={{ name: 'tag', params: { tag: tag.id } }} class="mr-2">
                            {`#${tag.name}`}
                          </nuxt-link>
                        ))}
                      </div>
                    </VCardSubtitle>
                  </div>
                  {thumbnail ? (
                    <div>
                      <VAvatar class="ma-3" size="125" tile>
                        <VImg src={thumbnail} />
                      </VAvatar>
                    </div>
                  ) : null}
                </div>
              </VCard>
            ))}
          </VCol>
          <VCol cols="4">
            <h1>Sidebar</h1>
          </VCol>
        </VRow>
      </VContainer>
    );
  }
}
