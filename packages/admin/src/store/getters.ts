/**
 * root getters
 */

const getters = {
  theme: (state: any) => state.app.theme,
  color: (state: any) => state.app.color,
  multiTab: (state: any) => state.app.multiTab,
  avatar: (state: any) => state.user.avatar,
  nickname: (state: any) => state.user.name,
  welcome: (state: any) => state.user.welcome,
  roles: (state: any) => state.user.roles,
  userInfo: (state: any) => state.user.info,
};

export default getters;
