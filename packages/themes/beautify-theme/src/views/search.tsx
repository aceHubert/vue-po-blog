import { Vue, Component } from 'vue-property-decorator';
import { VApp, VContainer, VForm, VTextField, VBtn, VIcon } from '@/components/vuetify-tsx';

@Component({
  name: 'b-theme-search',
  layout: 'blank',
  transition: 'dialog-bottom-transition',
  head: {
    title: '搜索',
  },
})
export default class ThemeSearch extends Vue {
  searchText = '';

  render() {
    const container = (
      <VContainer class="search">
        <VForm>
          <VTextField
            v-model={this.searchText}
            solo
            dense={!this.$vuetify.breakpoint.mdAndUp}
            placeholder="Search"
            appendIcon="mdi-magnify"
            {...{
              on: {
                'click:append': () => {
                  this.searchText &&
                    this.$router.replace({ name: 'b-theme-search-keywords', params: { keywords: this.searchText } });
                },
              },
            }}
          ></VTextField>
          <p class="mb-2 caption">历史记录:</p>
        </VForm>
      </VContainer>
    );

    return this.$vuetify.breakpoint.mdAndUp ? (
      <VApp>
        <div class="mb-10 text-right">
          <VBtn icon large class="mt-5 mr-5" onClick={() => this.$router.back()}>
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </div>
        {container}
      </VApp>
    ) : (
      <VApp>{container}</VApp>
    );
  }
}
