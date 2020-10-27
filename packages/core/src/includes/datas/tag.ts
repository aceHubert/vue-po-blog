import { http } from '../functions';

// Types
import { TagApi } from 'types/datas/tag';

export const tagApi: TagApi = {
  /**
   * 获取标签列表
   */
  getList() {
    return http.get('tags/tags-article-quantity/v1/list').then(({ data: { models } = {} }) => models);
  },

  /**
   * 获取标签数量
   */
  getCount() {
    return http.get('tags/tags/v1/count').then(({ data: { model = 0 } }) => model);
  },

  /**
   * 获取标签详情
   * @param id 标签 ID
   */
  get(id: number) {
    return http.get(`tags/tags/v1/${id}`).then(({ data: { model } }) => model);
  },
};