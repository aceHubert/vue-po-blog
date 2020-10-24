/**
 * core 内部使用
 */
import { http } from '../functions';

// Types
import { Theme } from 'types/functions/theme';
import { SiteSettings, UserInfo } from 'types/functions/settings';

export const siteApi = {
  /**
   * 获取网站配置
   */
  getConfigs(): Promise<Record<string, any>> {
    return http.get('config/config-base/v1/list').then(({ data: { models = [] } = {} }) => {
      return (models as Array<{ configKey: string; configValue: any }>).reduce((obj, curr) => {
        obj[curr['configKey'] as keyof SiteSettings] = curr['configValue'];
        return obj;
      }, {} as Record<string, any>);
    });
  },

  /**
   * 获取主题配置
   */
  getTheme(): Promise<{ dark: boolean; themes: Partial<Theme> }> {
    return http.get('config/theme/v1/list').then(({ data: { model = {} } = {} }) => model);
  },

  /**
   * 获取用户配置
   */
  getUserInfo(): Promise<Partial<UserInfo>> {
    return http.get('auth/master/v1/get').then(({ data: { model = {} } = {} }) => model);
  },

  /** 获取主题模块 */
  getThemeModule(): Promise<ModuleConfig> {
    return http.get('v1/plumemo/module/theme').then(({ data: { model } = {} }) => model);
  },

  /** 获取插件模块 */
  getPluginModules(): Promise<ModuleConfig[]> {
    return http.get('v1/plumemo/module/plugins').then(({ data: { models = [] } = {} }) => models);
  },
};
