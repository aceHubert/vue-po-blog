import { Vue, Component, Watch } from 'nuxt-property-decorator';
import { snakeCase } from 'lodash-es';

export type BreadItem = {
  label: string;
  to: string;
  isLink?: boolean;
};

@Component({
  name: 'Breadcrumb',
})
export default class Breadcrumb extends Vue {
  name?: string | null;
  breadItems!: BreadItem[];
  data() {
    return {
      name: '',
      breadItems: [],
    };
  }

  @Watch('$route')
  watchRoute() {
    this.getBreadcrumb();
  }

  getBreadcrumb() {
    const items: BreadItem[] = [];
    // this.breadList.push({name: 'index', path: '/dashboard/', meta: {title: '首页'}})

    this.name = this.$route.name;
    const matched = this.$route.matched;
    matched.forEach(({ name, path, meta: { title } }, index) => {
      // item.name !== 'index' && this.breadList.push(item)
      if (index > 0) {
        const prevRoute = matched[index - 1];
        const { resolved } = this.$router.resolve(prevRoute.path);
        if (resolved.name === name) {
          // 嵌套路由与parent 路由相同，直接修改上一个的 label
          items[index - 1].label =
            (title && (this.$tv(`core.breadcrumb.${snakeCase(title)}`, title) as string)) ||
            (name && (this.$tv(`core.breadcrumb.${snakeCase(name)}`, name) as string)) ||
            '';
          return;
        }
        items[index - 1].isLink = true; // 最后一个不可点击
      }
      items.push({
        label:
          (title && (this.$tv(`core.breadcrumb.${snakeCase(title)}`, title) as string)) ||
          (name && (this.$tv(`core.breadcrumb.${snakeCase(name)}`, name) as string)) ||
          '',
        to: path,
      });
    });
    this.breadItems = items;
  }

  created() {
    this.getBreadcrumb();
  }

  render() {
    return (
      <a-breadcrumb class="breadcrumb">
        {this.breadItems.map((item) => (
          <a-breadcrumb-item>
            {item.isLink ? (
              <nuxt-link to={{ path: item.to || '/' }}>{item.label}</nuxt-link>
            ) : (
              <span>{item.label}</span>
            )}
          </a-breadcrumb-item>
        ))}
      </a-breadcrumb>
    );
  }
}
