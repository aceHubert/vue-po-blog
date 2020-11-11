import { http } from '../functions';

export const tagApi = {
  fetchTagsList(query: any) {
    return http({
      url: '/tags/tags/v1/list',
      method: 'get',
      params: query,
    });
  },

  fetchTags(id: number) {
    return http({
      url: `/tags/tags/v1/${id}`,
      method: 'get',
    });
  },

  createTags(data: any) {
    return http({
      url: '/tags/tags/v1/add',
      method: 'post',
      data,
    });
  },

  updateTags(data: any) {
    return http({
      url: '/tags/tags/v1/update',
      method: 'put',
      data,
    });
  },

  deleteTags(id: any) {
    return http({
      url: `/tags/tags/v1/${id}`,
      method: 'delete',
    });
  },
};
