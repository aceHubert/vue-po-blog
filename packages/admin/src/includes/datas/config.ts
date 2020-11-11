import { http } from '../functions';

export const configApi = {
  fetchConfigList(query: any) {
    return http({
      url: '/config/config/v1/list',
      method: 'get',
      params: query,
    });
  },

  updateConfig(data: any) {
    return http({
      url: '/config/config/v1/update',
      method: 'put',
      data,
    });
  },
};
