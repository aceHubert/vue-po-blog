/**
 * 挂载到 Vue.prototype 上的方法
 */

// functions
export { hook } from './functions/hooks';
export { getCurrentTheme, getThemes, isDark } from './functions/theme';
export {
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
} from './functions/locale';
export { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP } from './functions/settings';

// api
export { postApi, siteApi } from './datas';
