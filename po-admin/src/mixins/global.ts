import { Vue, Component } from 'nuxt-property-decorator';
import { UserCapability } from '@/includes/datas/enums';
import { userStore } from '@/store/modules';

@Component
export default class GlobalMixin extends Vue {
  /**
   * 判断用户是否的操作的权限
   * @param capabilities 权限（任何一个即可）
   */
  hasCapability(...capabilities: UserCapability[]): boolean {
    if (userStore.role) {
      return userStore.capabilities.some((capability) => capabilities.includes(capability));
    }
    return false;
  }

  /**
   * 修改 router query
   * @param query
   * @param option
   */
  updateRouteQuery(query: Dictionary<string | undefined>, { replace = false }: { replace?: boolean } = {}): void {
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
