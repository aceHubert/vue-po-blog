import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { Route } from 'vue-router';
import en from '@/lang/en';
import { localeFuncs } from '@/includes/functions';

// Types
import { Plugin } from '@nuxt/types';
import { LangConfig } from 'types/functions/locale';

Vue.use(VueI18n);

/**
 * 扩展方法
 * tv(key, default, locale) 如果 key 的翻译没有则为 fallbackStr, 如果 fallbackStr 没有，则为 key
 */
Object.defineProperties(VueI18n.prototype, {
  tv: {
    value: function (key: string, fallbackStr: string, locale?: string) {
      return (this.t && this.te ? (this.te(key, locale) ? this.t(key, locale) : fallbackStr) : fallbackStr) || key;
    },
    writable: false,
  },
});

const plugin: Plugin = (cxt) => {
  const defaultLocale = localeFuncs.getDefaultLocale();
  const fallbackLocale = defaultLocale;
  const globalLanguages: { [locale: string]: any } = {};
  const hasDocument = typeof document !== 'undefined';
  const loadedLanguages: string[] = [defaultLocale]; // 预装默认语言

  let locale = defaultLocale;

  if (process.server && (cxt as any).ssrContext && (cxt as any).ssrContext.lang) {
    locale = (cxt as any).ssrContext.lang;
  } else if (hasDocument) {
    locale = document.documentElement.lang;
  }

  const i18n = new VueI18n({
    locale,
    fallbackLocale,
    messages: {
      [defaultLocale]: en, //require(`@/lang/${defaultLocale}`).default,
    },
    silentFallbackWarn: true,
  });

  function setI18nLanguage(lang: string) {
    i18n.locale = lang;
    if (hasDocument) {
      document.querySelector('html')!.setAttribute('lang', lang);
    }
    return lang;
  }

  /**
   * 动态加载语言名，默认打包语言包含zh-CN, en-US
   * 其它扩展可将语言包json 文件放在 static/langs/ 目录下
   * @param {string} lang language code
   * @returns {Promise<string>} language code
   */
  function loadLanguageAsync(lang: string): Promise<string> {
    if (i18n.locale !== lang) {
      if (!loadedLanguages.includes(lang)) {
        const { locale } =
          localeFuncs.getSupportLanguages().find((l: LangConfig) => lang === l.alternate || lang === l.locale) || {};

        if (locale) {
          return import(/* webpackChunkName: "locale-[request]" */ `@/lang/${locale}`).then((msgs) => {
            const { default: translates, dateTimeFormat, numberFormat } = msgs;
            loadedLanguages.push(lang);
            globalLanguages[lang] = translates;
            i18n.setLocaleMessage(lang, globalLanguages[lang]);
            // setting datetime & number format
            dateTimeFormat && i18n.setDateTimeFormat(lang, dateTimeFormat);
            numberFormat && i18n.setNumberFormat(lang, numberFormat);

            return setI18nLanguage(lang);
          });
        } else {
          return Promise.reject(new Error('Language not found'));
          // 扩展语言包加载
          // TODO: 远程加载语言
          // return createHttp()
          //   .get(`${process.env.BASE_URL || '/'}static/langs/${lang}.json`)
          //   .then(({ data = {} }) => {
          //     const { dateTimeFormat, numberFormat, ...translates } = data;
          //     i18n.setLocaleMessage(lang, translates);
          //     dateTimeFormat && i18n.setDateTimeFormat(lang, dateTimeFormat);
          //     numberFormat && i18n.setNumberFormat(lang, numberFormat);
          //     loadedLanguages.push(lang);
          //     return setI18nLanguage(lang);
          //   })
          //   .catch(() => {
          //     return new Error('unsupport language');
          //   });
        }
      }
      return Promise.resolve(setI18nLanguage(lang));
    }
    return Promise.resolve(lang);
  }

  // 路由变化后的语言变化
  cxt.app.router!.beforeEach((to: Route, from: Route, next: () => void) => {
    to.query.lang
      ? loadLanguageAsync(to.query.lang as string)
          .then(() => next())
          .catch(() => {})
      : next();
  });

  cxt.app.i18n = i18n;

  // 添加 i18n 到 Context
  cxt.$i18n = i18n;
};

export default plugin;
