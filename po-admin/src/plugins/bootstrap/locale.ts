/**
 * 多语言设置
 */
import VueI18n from 'vue-i18n';
import { appStore } from '@/store/modules';

// Locales
import { genLocaleConfig } from '@/utils/router';

// Types
import { Plugin } from '@nuxt/types';

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
  const locale = await appStore.getTranslations();
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
