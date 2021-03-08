// Types
import { ResolveTree } from '@/utils/fieldsDecorators';

export default class BaseResolver {
  /**
   * 获取字段名
   * @param root
   */
  getFieldNames(root: { [key: string]: ResolveTree }) {
    return Object.keys(root).map((key) => root[key].name || key);
  }
}
