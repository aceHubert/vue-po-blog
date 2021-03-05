/**
 * 传递给子模块入口函数参数 options 上
 */

import hook from './functions/hooks';
import localeFunctions from './functions/locale';
import settingsFunctions from './functions/settings';

// Types
import { ModuleOptions } from 'types/module-options';

const { getDefaultLocale, getSupportLanguages, addSupportLanguages, setDefaultLocale, setLocale } = localeFunctions;
const { getBaseUrl, getGraphqlPath, getGraphqlWsPath, getApiPath } = settingsFunctions;

const moduleOptions: Omit<ModuleOptions, 'addRoutes'> = {
  hook,
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
  getBaseUrl,
  getGraphqlPath,
  getGraphqlWsPath,
  getApiPath,
};

export default moduleOptions;
