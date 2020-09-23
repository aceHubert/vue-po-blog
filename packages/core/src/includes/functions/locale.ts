import Vue from 'vue';
import merge from 'lodash.merge';

// Types
import { Locale, SupportLanguage } from 'types/functions/locale';

export const globalLocale: Locale = Vue.observable({
  default: 'en',
  supportLanguages: [
    {
      name: '简体中文',
      shortName: '中',
      locale: 'zh-CN',
      fallback: true,
    },
    {
      name: 'English',
      shortName: 'EN',
      locale: 'en-US',
      alternate: 'en',
    },
  ],
});

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取默认语言 locale
 */
export function getDefaultLocale() {
  return globalLocale.default;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取支持语言列表
 */
export function getSupportLanguages() {
  return globalLocale.supportLanguages;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 设置默认语言 locale
 */
export function setDefaultLocale(locale: string) {
  globalLocale.default = locale;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 添加支持语言列表
 */
export function addSupportLanguages(languages: SupportLanguage | SupportLanguage[]) {
  globalLocale.supportLanguages = globalLocale.supportLanguages.concat(languages);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 设置语言配置
 */
export function setLocale(locale: Partial<Locale>) {
  merge(globalLocale, locale);
}
