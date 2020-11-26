import { Path, Locale, TranslateResult } from 'vue-i18n';

declare class VueI18n {
  tv(key: Path, fallbackStr: string, locale?: Locale): TranslateResult;
}
