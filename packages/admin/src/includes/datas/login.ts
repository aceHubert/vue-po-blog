import { http } from '../functions';

export const loginApi = {
  login(data: any) {
    return http({
      url: '/auth/admin/v1/login',
      method: 'post',
      data,
    });
  },

  socialLogin(data: any) {
    return http({
      url: '/auth/admin/v1/login',
      method: 'post',
      data,
    });
  },

  logout() {
    return http({
      url: '/auth/auth/v1/logout',
      method: 'post',
    });
  },

  register(parameter: any) {
    return http({
      url: '/auth/admin/v1/register',
      method: 'post',
      data: parameter,
    });
  },

  getOauthLoginByGithub(params: any) {
    return http({
      url: '/auth/github/v1/get',
      method: 'get',
      params,
    });
  },

  getSmsCaptcha(parameter: any) {
    return http({
      url: '/byteblogs/email/v1/send',
      method: 'post',
      data: parameter,
    });
  },

  getInfo() {
    return http({
      url: '/user/info',
      method: 'get',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });
  },

  getCurrentUserNav(_token: string) {
    return http({
      url: '/user/nav',
      method: 'get',
    });
  },

  /**
   * get user 2step code open?
   * @param parameter {*}
   */
  get2step(parameter: any) {
    return http({
      url: '/auth/2step-code',
      method: 'post',
      data: parameter,
    });
  },
};
