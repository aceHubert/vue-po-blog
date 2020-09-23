export type Locale = {
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
