export type Menu = {
  name: string;
  title: string;
  icon?: string;
  children?: Menu[];
};

export type SiteSettings = {
  domain: string;
  staticDir: string;
  siderMenus: Menu[];
};

export type UserInfo = {
  name: string;
  avatar?: string;
  email?: string;
  introduction?: string;
};

export interface SettingsFunctions {
  getDomain(): SiteSettings['domain'];
  getStaticDir(): SiteSettings['staticDir'];
  getSiderMenus(): SiteSettings['siderMenus'];
  getApiPath(): string;
  getUserInfo(): UserInfo;
  setSiteSettings(settings: Partial<SiteSettings>): void;
  setUserInfo(userInfo: Partial<UserInfo>): void;
}
