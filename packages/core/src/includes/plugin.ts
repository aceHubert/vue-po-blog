/**
 * 传递给插件的方法
 */
export { hook } from './functions/hooks';
export { getCurrentTheme, getThemes, isDarkTheme } from './functions/theme';
export {
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
} from './functions/locale';
export { hasLayout, getLayouts, hasWidget, getWidgets, hasTemplate, getTemplates } from './functions/layout';
export { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP, getUserInfo } from './functions/settings';
