import { http } from '../functions';

// Types
import { Users, AuthApi } from 'types/datas/auth';

function formatUsers(users: any, includeContent = false): Users {
  const {
    // 主键
    id,
    // 用户名
    username,
    // 用户昵称
    niceName,
    // 邮箱
    email,
    // 用户网址
    url,
    // 创建时间
    createdAt,
    // 更新时间
    updatedDt,
    // 0禁用 1正常
    userStatus,
    // 来前台显示出来的用户名字
    displayName,
  } = users;
  return Object.assign({
    // 主键
    id,
    // 用户名
    username,
    // 用户昵称
    niceName,
    // 邮箱
    email,
    // 用户网址
    url,
    // 创建时间
    createdAt,
    // 更新时间
    updatedDt,
    // 0禁用 1正常
    userStatus,
    // 来前台显示出来的用户名字
    displayName,
  });
}

export const authApi: AuthApi = {
  /**
   * 登录
   * @param query
   */
  login(query) {
    return http.post('admin/users/login', query).then(({ model }) => model);
  },

  /**
   * 退出登录
   */
  logout() {
    return http.post('admin/user/logout').then(() => true);
  },

  /**
   * 获取登录用户信息
   */
  getLoginUserInfo() {
    return http.get('admin/users/login/info').then(({ model }) => model);
  },

  /**
   * 获取分页的用户列表
   */
  getPageList() {
    return http.getList('admin/users/pages').then(({ models, pageInfo }) => {
      return {
        rows: models.map((plugin) => formatUsers(plugin)),
        pager: pageInfo!,
      };
    });
  },

  /**
   * 获取用户列表
   */
  getList() {
    return http.getList('admin/users').then(({ models }) => {
      return models.map((plugin) => formatUsers(plugin));
    });
  },
};
