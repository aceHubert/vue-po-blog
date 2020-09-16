/**
 * 传递给主题的方法
 */

export { getCurrentTheme, getThemes, isDark, setDark, setThemes } from './functions/theme';
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
export { hook } from './functions/hooks';
export { getDomain, getLogo, getStaticDir, getApiPath, getCopyright, getICP } from './functions/settings';
