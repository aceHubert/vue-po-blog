import { Vue, Component } from 'vue-property-decorator';

// Types
import { Category } from '@plumemo/devtools';

@Component({
  name: 'widget-category-admin',
})
export default class WidgetCategory extends Vue {
  categories: Category[] = [];

  created() {
    this.categoryApi.getList().then((items: Category[]) => {
      this.categories = items;
    });
  }

  render() {
    return (
      <div class="category">
        <ul>
          {this.categories.map((category) => (
            <li>
              <nuxt-link to={`/category/${category.id}`} class="body-2 text-decoration-none">
                {category.name}
              </nuxt-link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
