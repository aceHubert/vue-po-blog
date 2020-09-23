/**
 * 挂载到 Vue.prototype 上的方法
 */

// functions
export { hook } from './functions/hooks';
export { getCurrentTheme, getThemes, isDarkTheme } from './functions/theme';
export {
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
} from './functions/locale';
export { hasWidget, getWidgets } from './functions/layout';
export { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP, getUserInfo } from './functions/settings';

// api
export { categoryApi, tagApi, postApi, siteApi } from './datas';
