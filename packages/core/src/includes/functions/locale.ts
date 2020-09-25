import Vue from 'vue';
import merge from 'lodash.merge';

// Types
import { LocaleFunctions, Locale } from 'types/functions/locale';

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

const localeFunctions: LocaleFunctions = {
  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 获取默认语言 locale
   */
  getDefaultLocale: function () {
    return globalLocale.default;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 获取支持语言列表
   */
  getSupportLanguages: function () {
    return globalLocale.supportLanguages;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置默认语言 locale
   */
  setDefaultLocale: function (locale) {
    globalLocale.default = locale;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 添加支持语言列表
   */
  addSupportLanguages: function (languages) {
    globalLocale.supportLanguages = globalLocale.supportLanguages.concat(languages);
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置语言配置
   */
  setLocale: function (locale: Partial<Locale>) {
    merge(globalLocale, locale);
  },
};

export default localeFunctions;
