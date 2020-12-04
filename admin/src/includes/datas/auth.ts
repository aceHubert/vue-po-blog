import { http } from '../functions';

// Types
import { AuthApi } from 'types/datas/auth';

export const authApi: AuthApi = {
  login(query) {
    return http.post('admin/user/login', query).then(({ model }) => model);
  },

  logout() {
    return http.post('admin/user/logout').then(() => true);
  },

  /**
   * 获取登录用户信息
   */
  getLoginUserInfo() {
    return http.get('admin/user/login/info').then(({ model }) => model);
  },
};
