/**
 * 传递给主题的方法
 */

export { hook } from './functions/hooks';
export { getCurrentTheme, getThemes, isDark, setDark, setThemes } from './functions/theme';
export {
  getDefaultLocale,
  getSupportLanguages,
  addSupportLanguages,
  setDefaultLocale,
  setLocale,
} from './functions/locale';
export {
  hasLayout,
  getLayout,
  getLayouts,
  addLayout,
  addLayouts,
  hasTemplate,
  getTemplate,
  getTemplates,
  addTemplate,
  addTemplates,
  removeTemplates,
} from './functions/layout';
export { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP } from './functions/settings';
