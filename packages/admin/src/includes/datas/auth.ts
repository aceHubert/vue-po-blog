import { http } from '../functions';

// Types
import { AuthApi } from 'types/datas/auth';

export const authApi: AuthApi = {
  login(query) {
    return http.post('/v1/admin/user/login', query).then(({ model }) => model);
  },

  // socialLogin(data: any) {
  //   return http({
  //     url: '/auth/admin/v1/login',
  //     method: 'post',
  //     data,
  //   });
  // },

  logout() {
    return http.post('/v1/admin/user/logout').then(() => true);
  },

  // register(parameter: any) {
  //   return http({
  //     url: '/auth/admin/v1/register',
  //     method: 'post',
  //     data: parameter,
  //   });
  // },

  // getOauthLoginByGithub(params: any) {
  //   return http({
  //     url: '/auth/github/v1/get',
  //     method: 'get',
  //     params,
  //   });
  // },

  // getSmsCaptcha(parameter: any) {
  //   return http({
  //     url: '/byteblogs/email/v1/send',
  //     method: 'post',
  //     data: parameter,
  //   });
  // },

  /**
   * 获取登录用户信息
   */
  getLoginUserInfo() {
    return http.get('/v1/admin/user/login').then(({ model }) => model);
  },

  // getCurrentUserNav(_token: string) {
  //   return http({
  //     url: '/user/nav',
  //     method: 'get',
  //   });
  // },

  // /**
  //  * get user 2step code open?
  //  * @param parameter {*}
  //  */
  // get2step(parameter: any) {
  //   return http({
  //     url: '/auth/2step-code',
  //     method: 'post',
  //     data: parameter,
  //   });
  // },
};
