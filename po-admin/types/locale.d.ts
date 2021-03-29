import Vue from 'vue';
import { Path, Locale, Values, TranslateResult } from 'vue-i18n';

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface IVueI18n {
    tv(key: Path, fallbackStr: string, values?: Values): TranslateResult;
    tv(key: Path, fallbackStr: string, locale?: Locale, values?: Values): TranslateResult;
  }

  interface ComponentOptions<V extends Vue> {
    i18n?: {
      locale: string;
    };
  }
}

export type LangConfig = {
  name: string;
  shortName: string;
  icon?: string;
  locale: string;
  alternate?: string;
};
