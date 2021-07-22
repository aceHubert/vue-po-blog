/**
 * 多语言设置
 */
import warning from 'warning';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { appStore } from '@/store/modules';

// Locales
import { genLocaleConfig } from '@/utils/router';

// Types
import { Plugin } from '@nuxt/types';

Vue.use(VueI18n);

/**
 * 扩展方法
 * tv(key, default, locale) 如果 key 的翻译没有则为 fallbackStr, 如果 fallbackStr 没有，则为 key
 */
Object.defineProperties(VueI18n.prototype, {
  tv: {
    value: function (this: VueI18n, key: VueI18n.Path, fallbackStr: string, ...values: any) {
      const locale = typeof values[0] == 'string' ? values[0] : undefined;
      return (this.te(key, locale) ? this.t(key, ...values) : fallbackStr) || key;
    },
    writable: false,
    enumerable: true,
    configurable: true,
  },
});

/**
 * 扩展VueI18n.tv方法添加到 Vue 实例中
 */
Object.defineProperties(Vue.prototype, {
  $tv: {
    value: function (this: Vue, key: VueI18n.Path, fallbackStr: string, ...values: any): VueI18n.TranslateResult {
      const i18n = this.$i18n;
      return i18n.tv(key, fallbackStr, ...values);
    },
    writable: false,
    enumerable: true,
    configurable: true,
  },
});

export async function Locale(...params: Parameters<Plugin>) {
  const cxt = params[0];

  let defaultLocale = appStore.locale;
  const { hasLocale, preferredLocale } = genLocaleConfig({
    locale: defaultLocale,
    supportLanguages: appStore.supportLanguages,
  });

  if (!defaultLocale || !hasLocale(defaultLocale)) {
    defaultLocale = preferredLocale;
  }

  const fallbackLocale = 'en-US';
  const locale = await appStore.getTranslations().catch((err) => {
    warning(process.env.NODE_ENV === 'production', err.message);
    return { translations: {} };
  });
  const messages: Dictionary<any> = Object.assign(
    {
      [fallbackLocale]: {}, // fallback locale
    },
    locale.translations,
  );

  const i18n = new VueI18n({
    locale: defaultLocale,
    fallbackLocale,
    messages,
    silentFallbackWarn: true,
  });

  cxt.app.i18n = i18n;
  cxt.$i18n = i18n as any; // 添加 i18n 到 Context, todo: type error
}
