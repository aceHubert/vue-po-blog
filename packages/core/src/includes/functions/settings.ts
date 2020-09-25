import Vue from 'vue';
import merge from 'lodash.merge';
import { trailingSlash, isAbsoluteUrl } from '@/utils/path';

// Types
import { SettingsFunctions, SiteSettings, UserInfo } from 'types/functions/settings';

export const globalSettings: SiteSettings = Vue.observable({
  name: '',
  domain: '',
  icp: null,
  copyright: null,
  staticDir: 'static/',
  apiPath: 'api/blog/',
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
   * 配置的域名（末尾带有"/"
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
    return trailingSlash(
      isAbsoluteUrl(globalSettings.apiPath)
        ? globalSettings.apiPath
        : this.getDomain() +
            (globalSettings.apiPath.startsWith('/') ? globalSettings.apiPath.substr(1) : globalSettings.apiPath),
    );
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * Copyright
   */
  getCopyright: function () {
    return globalSettings.copyright;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * ICP
   */
  getICP: function () {
    return globalSettings.icp;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 配置的 Logo, todo:扩展支持图片
   */
  getLogo: function () {
    return {
      type: 'text',
      content: globalSettings.name,
    };
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
