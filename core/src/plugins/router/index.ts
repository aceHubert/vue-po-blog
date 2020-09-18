import { Route } from 'vue-router';
import { globalLocale } from '@/includes';

// Types
import { Plugin } from '@nuxt/types';

// Utilities
import { genLocaleConfig } from './utils';

const plugin: Plugin = (cxt) => {
  const router = cxt.app.router!;

  router.beforeEach((to: Route, from: Route, next: any) => {
    const { languageRegexp, preferredLanguage } = genLocaleConfig(globalLocale);
    if (to.query.lang && !languageRegexp.test(to.query.lang as string)) {
      to.query.lang = preferredLanguage;
      next(to);
    } else {
      next();
    }
  });
};

export default plugin;
