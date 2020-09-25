/**
 * 传递给插件的方法
 */

import hook from './functions/hooks';
import themeFunctions from './functions/theme';
import localeFunctions from './functions/locale';
import layoutFunctions from './functions/layout';
import settingsFunctions from './functions/settings';

// Types
import { PluginOptions } from 'types/plugin-options';

const { getCurrentTheme, getThemes, isDarkTheme } = themeFunctions;
const { hasWidget, getWidgets, hasTemplate, getTemplates } = layoutFunctions;
const { getDefaultLocale, getSupportLanguages, addSupportLanguages, setDefaultLocale, setLocale } = localeFunctions;
const { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP, getUserInfo } = settingsFunctions;

const pluginOptions: PluginOptions = {
  hook,
  getCurrentTheme,
  getThemes,
  isDarkTheme,
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
  hasWidget,
  getWidgets,
  hasTemplate,
  getTemplates,
  getDomain,
  getLogo,
  getStaticDir,
  getApiPath,
  getCopyright,
  getICP,
  getUserInfo,
};

export default pluginOptions;
