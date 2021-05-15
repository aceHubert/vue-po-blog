import { Vue, Component, Watch } from 'nuxt-property-decorator';
import { camelCase } from 'lodash-es';

export type Bread = {
  label: string;
  to: string;
  isLink?: boolean;
};

@Component({
  name: 'Breadcrumb',
})
export default class Breadcrumb extends Vue {
  name?: string | null;
  breadList!: Bread[];
  data() {
    return {
      name: '',
      breadList: [],
    };
  }

  @Watch('$route')
  watchRoute() {
    this.getBreadcrumb();
  }

  getBreadcrumb() {
    const list: Bread[] = [];
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
          list[index - 1].label =
            (title && (this.$tv(`breadcrumb.${camelCase(title)}`, title) as string)) ||
            (name && (this.$tv(`breadcrumb.${camelCase(name)}`, name) as string)) ||
            '';
          return;
        }
        list[index - 1].isLink = true; // 最后一个不可点击
      }
      list.push({
        label:
          (title && (this.$tv(`breadcrumb.${camelCase(title)}`, title) as string)) ||
          (name && (this.$tv(`breadcrumb.${camelCase(name)}`, name) as string)) ||
          '',
        to: path,
      });
    });
    this.breadList = list;
  }

  created() {
    this.getBreadcrumb();
  }

  render() {
    return (
      <a-breadcrumb class="breadcrumb">
        {this.breadList.map((item) => (
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
