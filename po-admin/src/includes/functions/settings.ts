import { trailingSlash } from '@/utils/path';

// Types
import { SettingsFunctions, SiteSettings } from 'types/functions/settings';

export const globalSettings: SiteSettings = {
  baseUrl: process.env.baseUrl!, // api请求的域名，api在不同域名或ssr情况下是必须的
  basePath: 'admin/', // 与vue-router 配置的 base 保持一致
};

const settingsFunctions: SettingsFunctions = {
  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * baseUrl（末尾带有"/")
   */
  getBaseUrl() {
    return trailingSlash(globalSettings.baseUrl);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * vue-router base
   */
  getBasePath() {
    return trailingSlash(globalSettings.basePath);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * API 地址，[baseUrl]/api
   */
  getApiPath() {
    return trailingSlash(globalSettings.baseUrl) + 'api';
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * Graphql 地址 [baseUrl]/graphql
   */
  getGraphqlPath() {
    return trailingSlash(globalSettings.baseUrl) + 'graphql';
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * Graphql ws地址
   */
  getGraphqlWsPath() {
    return trailingSlash(globalSettings.baseUrl).replace(/http(s?)/, 'ws') + 'graphql';
  },
};

export default settingsFunctions;
