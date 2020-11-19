import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { hook, globalLocale, localeFuncs } from '@/includes/functions';

// Locales
import enUS from '@/lang/en-US';
import zhCN from '@/lang/zh-CN';
import { APP_LANGUAGE } from '@/config/proLayoutConfigs';
import { genLocaleConfig } from '../router/utils';

// Types
import { Route } from 'vue-router';
import { Plugin } from '@nuxt/types';

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
    enumerable: true,
    configurable: true,
  },
});

const plugin: Plugin = (cxt) => {
  const { app } = cxt;

  const defaultLocale = Vue.ls.get(APP_LANGUAGE, localeFuncs.getDefaultLocale());
  const fallbackLocale = 'en-US';
  const messages: Dictionary<any> = {
    'en-US': enUS, // fallback locale
    'zh-CN': zhCN,
  };
  const hasDocument = typeof document !== 'undefined';

  // 自定义多语言消息
  hook('i18n-messages').exec(messages);

  const i18n = new VueI18n({
    locale: defaultLocale,
    fallbackLocale,
    messages,
    silentFallbackWarn: true,
  });

  new Vue({
    created() {
      this.$watch(
        () => i18n.locale,
        (val: string) => {
          Vue.ls.set(APP_LANGUAGE, val);
        },
      );
    },
  });

  function setI18nLanguage(lang: string) {
    i18n.locale = lang;
    if (hasDocument) {
      document.querySelector('html')!.setAttribute('lang', lang);
    }
    return lang;
  }

  // 路由变化后的语言变化
  const { localeRegexp, preferredLocale } = genLocaleConfig(globalLocale);
  app.router!.beforeEach((to: Route, from: Route, next: any) => {
    let locale: string;
    if ((locale = to.query.lang as string)) {
      if (!localeRegexp.test(locale)) {
        // 修正 query 上的语言
        to.query.lang = preferredLocale;
        setI18nLanguage(preferredLocale);
        next(to);
      } else {
        setI18nLanguage(locale);
        next();
      }
    } else {
      next();
    }
  });

  cxt.app.i18n = i18n;
  cxt.$i18n = i18n; // 添加 i18n 到 Context
};

export default plugin;
