import { http } from '../functions/http';

function formatThemeConfig(config: any) {
  const {
    dark,
    themes: { primary, secondary, accent, error, info, success, warning },
  } = config;
  return {
    dark,
    themes: {
      primary,
      secondary,
      accent,
      error,
      info,
      success,
      warning,
    },
  };
}

export const siteApi = {
  /**
   * 获取网站配置
   */
  getConfigs(): Promise<Dictionary<any>> {
    return http.get('config/config-base/v1/list').then(({ data: { models = [] } = {} }) => {
      return (models as Array<{ configKey: string; configValue: any }>).reduce((obj, curr) => {
        obj[curr['configKey']] = curr['configValue'];
        return obj;
      }, {} as Dictionary<any>);
    });
  },

  /**
   * 获取主题配置
   */
  getThemeConfigs(): Promise<Dictionary<any>> {
    return http.get('config/theme/v1/list').then(({ data: { model = [] } = {} }) => {
      return formatThemeConfig(model);
    });
  },

  /**
   * 获取用户配置
   */
  getUserInfo(): Promise<Dictionary<any>> {
    return http.get('auth/master/v1/get').then(({ data: { model = {} } = {} }) => {
      return model;
    });
  },
};
