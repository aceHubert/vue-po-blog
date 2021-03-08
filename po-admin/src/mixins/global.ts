import { Vue, Component } from 'nuxt-property-decorator';

@Component
export default class GlobalMixin extends Vue {
  /**
   * 修改 router query
   * @param query
   * @param option
   */
  updateRouteQuery(query: Dictionary<string | undefined>, { replace = false }: { replace?: boolean } = {}) {
    const oldQuery = this.$route.query;
    const path = this.$route.path;
    // 对象的拷贝
    const newQuery = Object.assign(JSON.parse(JSON.stringify(oldQuery)), query);

    // 移附 undefined 值
    for (const key in newQuery) {
      if (typeof newQuery[key] === 'undefined') {
        delete newQuery[key];
      }
    }
    if (replace) {
      this.$router.replace({ path, query: newQuery });
    } else {
      this.$router.push({ path, query: newQuery });
    }
  }
}
