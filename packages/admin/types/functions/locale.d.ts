export type LocaleConfig = {
  default: string;
  supportLanguages: SupportLanguage[];
};

export type LangConfig = {
  name: string;
  shortName: string;
  locale: string;
  alternate?: string;
};

export type SupportLanguage = {
  name: string;
  shortName: string;
  locale: string;
  alternate?: string;
  fallback?: boolean;
};

export interface LocaleFunctions {
  getDefaultLocale(): string;
  getSupportLanguages(): SupportLanguage[];
  setDefaultLocale(locale: string): void;
  addSupportLanguages(languages: SupportLanguage | SupportLanguage[]): void;
  setLocale(locale: Partial<LocaleConfig>): void;
}
