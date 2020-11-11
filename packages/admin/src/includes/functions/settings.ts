import Vue from 'vue';
import merge from 'lodash.merge';
import { trailingSlash } from '@/utils/path';
import menuConfigs from '@/config/menuCofnigs';

// Types
import { SettingsFunctions, SiteSettings, UserInfo } from 'types/functions/settings';

export const globalSettings: SiteSettings = Vue.observable({
  domain: '',
  staticDir: 'static/',
  siderMenus: menuConfigs,
});

export const globalUserInfo: UserInfo = Vue.observable({
  name: '',
  avatar: undefined,
  email: undefined,
  introduction: undefined,
});

const settingsFunctions: SettingsFunctions = {
  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 配置的域名（末尾带有"/")
   */
  getDomain: function () {
    return trailingSlash(globalSettings.domain);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 相对于配置域名的静态文件目录（末尾带有"/"）
   */
  getStaticDir: function () {
    return trailingSlash(globalSettings.staticDir);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * API 地址，如果不是http(s) 绝对路径，则会以当前域名为绝对路径
   */
  getApiPath: function () {
    return trailingSlash(process.env.baseUrl!) + 'api/blog/';
  },

  getSiderMenus() {
    return globalSettings.siderMenus;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 获取用户信息
   */
  getUserInfo: function () {
    return globalUserInfo;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置网站配置
   */
  setSiteSettings: function (settings) {
    merge(globalSettings, settings);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置用户信息
   */
  setUserInfo: function (userInfo) {
    merge(globalUserInfo, userInfo);
  },
};

export default settingsFunctions;
