/**
 * 传递给插件的方法
 */
export { hook } from './functions/hooks';
export { getCurrentTheme, getThemes, isDark } from './functions/theme';
export {
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
} from './functions/locale';
export { hasLayout, getLayout, getLayouts, hasTemplate, getTemplate, getTemplates } from './functions/layout';
export { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP } from './functions/settings';
