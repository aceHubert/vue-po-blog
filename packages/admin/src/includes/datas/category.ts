import { http } from '../functions';

export const categoryApi = {
  fetchCategoryLists(query: any) {
    return http({
      url: '/category/category/v1/list',
      method: 'get',
      params: query,
    });
  },

  fetchCategoryList(query: any) {
    return http({
      url: '/category/category-tags/v1/list',
      method: 'get',
      params: query,
    });
  },

  createCategory(data: any) {
    return http({
      url: '/category/category/v1/add',
      method: 'post',
      data,
    });
  },

  fetchCategory(id: number) {
    return http({
      url: `/category/category-tags/v1/${id}`,
      method: 'get',
    });
  },

  updateCategory(data: any) {
    return http({
      url: '/category/category/v1/update',
      method: 'put',
      data,
    });
  },

  deleteCategory(id: number) {
    return http({
      url: `/category/category/v1/${id}`,
      method: 'delete',
    });
  },
};
