import { http } from '../functions';

// Types
import { TagApi } from 'types/datas/tag';

export const tagApi: TagApi = {
  /**
   * 获取标签列表
   */
  getList() {
    return http.getList('/tags/tags/v1/list').then(({ models }) => models);
  },

  /**
   * 获取标签
   * @param id
   */
  get(id) {
    return http.get(`/tags/tags/v1/${id}`).then(({ model }) => model);
  },

  /**
   * 创建标签
   * @param data
   */
  create(data) {
    return http.post('/tags/tags/v1/add', data).then(({ model }) => model);
  },

  /**
   * 修改标签
   * @param data
   */
  update(data) {
    return http.put('/tags/tags/v1/update', data).then(() => true);
  },

  /**
   * 删除标签
   * @param id
   */
  delete(id) {
    return http.delete(`/tags/tags/v1/${id}`).then(() => true);
  },
};
