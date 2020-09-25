/**
 * 挂载到 Vue.prototype 上的方法
 */

// functions
import hook from './functions/hooks';
import themeFunctions from './functions/theme';
import localeFunctions from './functions/locale';
import layoutFunctions from './functions/layout';
import settingsFunctions from './functions/settings';

// apis
import { categoryApi, tagApi, postApi } from './datas';

// Types
import { VueExtraPrototypes } from 'types/vue';

const { getCurrentTheme, getThemes, isDarkTheme } = themeFunctions;
const { hasWidget, getWidgets } = layoutFunctions;
const { getDefaultLocale, getSupportLanguages, addSupportLanguages, setDefaultLocale, setLocale } = localeFunctions;
const { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP, getUserInfo } = settingsFunctions;

const prototypes: VueExtraPrototypes = {
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
  getDomain,
  getLogo,
  getStaticDir,
  getApiPath,
  getCopyright,
  getICP,
  getUserInfo,
  categoryApi,
  tagApi,
  postApi,
};

export default prototypes;
