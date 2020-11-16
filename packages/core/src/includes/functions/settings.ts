import merge from 'lodash.merge';
import { hasOwn } from '@vue-async/utils';
import { trailingSlash } from '@/utils/path';

// Types
import { UserInfo } from 'types/datas/site';
import { SettingsFunctions, SiteSettings } from 'types/functions/settings';

export const globalSettings: SiteSettings = {
  staticDir: 'static/',
  // 以上字段可以被服务端覆盖
  // 其它字段来自服务端
};

export const globalUserInfo: UserInfo = {
  name: '',
  avatar: undefined,
  email: undefined,
  introduction: undefined,
};

const settingsFunctions: SettingsFunctions = {
  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 根据 key 查找配置
   */
  getSettingByKey(key, defaultVal) {
    return hasOwn(globalSettings, key) ? globalSettings[key] : defaultVal;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 配置的域名（末尾带有"/")
   */
  getDomain() {
    return trailingSlash(settingsFunctions.getSettingByKey('domain', '/'));
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 相对于配置域名的静态文件目录（末尾带有"/"）
   */
  getStaticDir() {
    return trailingSlash(globalSettings.staticDir);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * API 地址，如果不是http(s) 绝对路径，则会以当前域名为绝对路径
   */
  getApiPath() {
    return trailingSlash(process.env.baseUrl!) + 'api/blog/';
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 配置的 Logo, todo:扩展支持图片
   */
  getLogo() {
    return {
      type: 'text',
      content: settingsFunctions.getSettingByKey('name', ''),
    };
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * Copyright
   */
  getCopyright() {
    return settingsFunctions.getSettingByKey('copyright', '');
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * ICP
   */
  getICP() {
    return settingsFunctions.getSettingByKey('icp', '');
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 获取用户信息
   */
  getUserInfo() {
    return globalUserInfo;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置网站配置
   */
  setSiteSettings(settings) {
    merge(globalSettings, settings);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置用户信息
   */
  setUserInfo(userInfo) {
    merge(globalUserInfo, userInfo);
  },
};

export default settingsFunctions;
