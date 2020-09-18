import { Vue, Component } from 'vue-property-decorator';
import { VContainer, VForm, VSheet, VTextField } from '@/components/vuetify-tsx';

@Component({
  name: 'theme-search',
  layout: 'fullscreen',
  transition: 'dialog-bottom-transition',
  head: {
    title: 'Search',
  },
})
export default class ThemeSearch extends Vue {
  searchText = '';

  render() {
    return (
      <VContainer class="search">
        <VForm>
          <VTextField
            v-model={this.searchText}
            solo
            dense
            placeholder="Search"
            appendIcon="mdi-magnify"
            {...{
              on: {
                'click:append': () => {
                  this.searchText &&
                    this.$router.replace({ name: 'theme-search-result', params: { keywords: this.searchText } });
                },
              },
            }}
          ></VTextField>
          <VSheet>
            <p class="mb-2 caption">histories:</p>
          </VSheet>
        </VForm>
      </VContainer>
    );
  }
}
