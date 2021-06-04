/**
 * 传递给子模块入口函数参数 options 上
 */

import hook from './functions/hooks';
import settingsFunctions from './functions/settings';

// Types
import { ModuleOptions } from 'types/module-options';

const { getServerUrl, getBasePath, getGraphqlPath, getGraphqlWsPath, getApiPath } = settingsFunctions;

const moduleOptions: Omit<ModuleOptions, 'addRoutes'> = {
  hook,
  getServerUrl,
  getBasePath,
  getGraphqlPath,
  getGraphqlWsPath,
  getApiPath,
};

export default moduleOptions;
