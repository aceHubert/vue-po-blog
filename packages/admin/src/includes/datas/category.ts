import { http } from '../functions';

// Types
import { CategoryApi } from 'types/datas/category';

export const categoryApi: CategoryApi = {
  /**
   * 获取分类列表
   */
  getList() {
    return http.getList('/category/category/v1/list').then(({ models = [] }) => models);
  },

  // fetchCategoryList(query: any) {
  //   return http({
  //     url: '/category/category-tags/v1/list',
  //     method: 'get',
  //     params: query,
  //   });
  // },

  /**
   * 获取分类
   * @param id
   */
  get(id) {
    return http.get(`/category/category-tags/v1/${id}`).then(({ model }) => model);
  },

  /**
   * 新建分类
   * @param data
   */
  create(data) {
    return http.post('/category/category/v1/add', data).then(({ model }) => model);
  },

  /**
   * 修改分类
   * @param data
   */
  update(data) {
    return http.put('/category/category/v1/update', data).then(() => true);
  },

  /**
   * 删除分类
   * @param id
   */
  delete(id) {
    return http.delete(`/category/category/v1/${id}`).then(() => true);
  },
};
