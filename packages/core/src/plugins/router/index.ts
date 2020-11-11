import { Route } from 'vue-router';
import { globalLocale } from '@/includes/functions';

// Types
import { Plugin } from '@nuxt/types';

// Utilities
import { genLocaleConfig } from './utils';

const plugin: Plugin = (cxt) => {
  const router = cxt.app.router!;
  const { languageRegexp, preferredLanguage } = genLocaleConfig(globalLocale);

  router.beforeEach((to: Route, from: Route, next: any) => {
    // 修正 query 语言
    if (to.query.lang && !languageRegexp.test(to.query.lang as string)) {
      to.query.lang = preferredLanguage;
      next(to);
    } else {
      next();
    }
  });
};

export default plugin;
