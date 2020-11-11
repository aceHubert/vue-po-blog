import { http } from '../functions';

export const userApi = {
  updatePassword(data: any) {
    return http({
      url: '/auth/password/v1/update',
      method: 'put',
      data,
    });
  },

  getInfo() {
    return http({
      url: '/auth/user/v1/get',
      method: 'get',
    });
  },

  updateStatus(data: any) {
    return http({
      url: '/auth/status/v1/update',
      method: 'put',
      data,
    });
  },

  updateUser(data: any) {
    return http({
      url: '/auth/admin/v1/update',
      method: 'put',
      data,
    });
  },

  getUserList(query: any) {
    return http({
      url: '/auth/user/v1/list',
      method: 'get',
      params: query,
    });
  },

  deleteUser(id: number) {
    return http({
      url: `/auth/user/v1/${id}`,
      method: 'delete',
    });
  },
};
