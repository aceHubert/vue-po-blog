export type SiteSettings = {
  name: string;
  domain: string;
  icp: string | null;
  copyright: string | null;
  staticDir: string;
  apiPath: string;
};

export type UserInfo = {
  name: string;
  avatar?: string;
  email?: string;
  introduction?: string;
};

export type SupportLanguage = {
  name: string;
  shortName: string;
  locale: string;
  alternate?: string;
  fallback?: boolean;
};

export type Locale = {
  default: string;
  supportLanguages: SupportLanguage[];
};
