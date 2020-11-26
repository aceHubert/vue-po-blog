/**
 * core 内部使用
 */
import { http } from '../functions';

// Types
import { SiteApi } from 'types/datas/site';
import { SiteSettings } from 'types/functions/settings';

export const siteApi: SiteApi = {
  /**
   * 获取网站配置
   */
  getConfigs() {
    return http.getList('config/config-base/v1/list').then(({ models = [] }) => {
      return (models as Array<{ configKey: string; configValue: any }>).reduce((obj, curr) => {
        obj[curr['configKey'] as keyof SiteSettings] = curr['configValue'];
        return obj;
      }, {} as Record<string, any>);
    });
  },

  /**
   * 获取主题配置
   */
  getTheme() {
    return http.get('config/theme/v1/list').then(({ model = {} }) => model);
  },

  /**
   * 获取用户配置
   */
  getUserInfo() {
    return http.get('auth/master/v1/get').then(({ model = {} }) => model);
  },

  /** 获取主题模块 */
  getThemeModule() {
    return http.get('v1/plumemo/module/theme').then(({ model }) => model);
  },

  /** 获取插件模块 */
  getPluginModules() {
    return http.getList('v1/plumemo/module/plugin').then(({ models = [] }) => models);
  },
};
