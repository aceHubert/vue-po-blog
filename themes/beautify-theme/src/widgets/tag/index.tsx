import { Vue, Component } from 'vue-property-decorator';
import { VAvatar, VChip } from '@/components/vuetify-tsx';

// Types
import { Tag } from '@plumemo/devtools/dev-core';

@Component({
  name: 'widget-tag',
})
export default class WidgetTag extends Vue {
  tags: Tag[] = [];

  created() {
    this.tagApi.getList().then((items: Tag[]) => {
      this.tags = items;
    });
  }

  render() {
    return (
      <div class="category">
        {this.tags.map((tag) => (
          <VChip small class="ma-2" color="primary" textColor="white" to={`/tag/${tag.id}`} nuxt>
            {tag.name}
            <VAvatar right class="accent darken-4">
              {tag.articleTotal}
            </VAvatar>
          </VChip>
        ))}
      </div>
    );
  }
}
