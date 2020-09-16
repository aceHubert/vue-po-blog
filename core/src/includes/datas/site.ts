import { http } from '../functions/http';

export const site = {
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
};
