import { UserInfo } from '../datas/site';

export type SiteSettings = {
  name: string;
  domain: string;
  icp: string | null;
  copyright: string | null;
  staticDir: string;
};

export interface SettingsFunctions {
  getDomain(): string;
  getStaticDir(): string;
  getApiPath(): string;
  getCopyright(): string | null;
  getICP(): string | null;
  getLogo(): { type: 'text' | 'image'; content: string };
  getUserInfo(): UserInfo;
  setSiteSettings(settings: Partial<SiteSettings>): void;
  setUserInfo(userInfo: Partial<UserInfo>): void;
}
