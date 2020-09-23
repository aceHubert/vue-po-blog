import { http } from '../functions/http';

// Types
import { Category } from 'types/datas/category';

export const categoryApi = {
  /**
   * 获取分类列表
   */
  getList(): Promise<Category[]> {
    return http.get('category/category/v1/list').then(({ data: { models } = {} }) => models);
  },

  /**
   * 获取分类数量
   */
  getCount(): Promise<number> {
    return http.get('category/category/v1/count').then(({ data: { model = 0 } }) => model);
  },

  /**
   * 获取分类详情
   * @param id 标签 ID
   */
  get(id: number): Promise<Category | null> {
    return http.get(`category/category/v1/${id}`).then(({ data: { model } }) => model);
  },
};
