import { http } from '../functions';

// Types
import { CategoryApi } from 'types/datas/category';

export const categoryApi: CategoryApi = {
  /**
   * 获取分类列表
   */
  getList() {
    return http.getList('admin/categories').then(({ models = [] }) => models);
  },

  /**
   * 获取分类
   * @param id
   */
  get(id) {
    return http.get(`admin/categories/${id}`).then(({ model }) => model);
  },

  /**
   * 新建分类
   * @param data
   */
  create(data) {
    return http.post('admin/categories', data).then(({ model }) => model);
  },

  /**
   * 修改分类
   * @param data
   */
  update(id, data) {
    return http.put(`admin/categories/${id}`, data).then(() => true);
  },

  /**
   * 删除分类
   * @param id
   */
  delete(id) {
    return http.delete(`admin/categories/${id}`).then(() => true);
  },
};
