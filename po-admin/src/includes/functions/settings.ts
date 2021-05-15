import { trailingSlash } from '@/utils/path';

// Types
import { SettingsFunctions } from 'types/functions/settings';

export const globalSettings: GlobalSettings = {
  serverUrl: '/', // server request url
  basePath: '/admin/', // vue-router base
};

const settingsFunctions: SettingsFunctions = {
  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * server request url（末尾带有"/")
   */
  getServerUrl() {
    return trailingSlash(globalSettings.serverUrl);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * vue-router base（末尾带有"/")
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
    return trailingSlash(globalSettings.serverUrl) + 'api';
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * Graphql 地址 [baseUrl]/graphql
   */
  getGraphqlPath() {
    return trailingSlash(globalSettings.serverUrl) + 'graphql';
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * Graphql ws地址
   */
  getGraphqlWsPath() {
    return trailingSlash(globalSettings.serverUrl).replace(/http(s?)/, 'ws') + 'graphql';
  },
};

export default settingsFunctions;
