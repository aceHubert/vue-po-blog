import { http } from '../functions/http';

// Types
import { Tag } from 'types/datas/tag';

export const tagApi = {
  /**
   * 获取标签列表
   */
  getList(): Promise<Tag[]> {
    return http.get('tags/tags-article-quantity/v1/list').then(({ data: { models } = {} }) => models);
  },

  /**
   * 获取标签数量
   */
  getCount(): Promise<number> {
    return http.get('tags/tags/v1/count').then(({ data: { model = 0 } }) => model);
  },

  /**
   * 获取标签详情
   * @param id 标签 ID
   */
  get(id: number): Promise<Tag | null> {
    return http.get(`tags/tags/v1/${id}`).then(({ data: { model } }) => model);
  },
};
