import { http } from '../functions';

// Types
import { TagApi } from 'types/datas/tag';

export const tagApi: TagApi = {
  /**
   * 获取标签列表
   */
  getList() {
    return http.getList('admin/tags').then(({ models }) => models);
  },

  /**
   * 获取标签
   * @param id
   */
  get(id) {
    return http.get(`admin/tags/${id}`).then(({ model }) => model);
  },

  /**
   * 创建标签
   * @param data
   */
  create(data) {
    return http.post('admin/tags', data).then(({ model }) => model);
  },

  /**
   * 修改标签
   * @param data
   */
  update(id, data) {
    return http.put(`admin/tags/${id}`, data).then(() => true);
  },

  /**
   * 删除标签
   * @param id
   */
  delete(id) {
    return http.delete(`admin/tags/${id}`).then(() => true);
  },
};
