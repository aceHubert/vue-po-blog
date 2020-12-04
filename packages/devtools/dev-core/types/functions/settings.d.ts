import { UserInfo } from '../datas/site';

export type SiteSettings = {
  staticDir: string;
  [key: string]: any;
};

export interface SettingsFunctions {
  getSettingByKey<T = string | undefined>(key: string, defaultValue?: NonNullable<T>): T;
  getDomain(): string;
  getStaticDir(): string;
  getApiPath(): string;
  getCopyright(): string;
  getICP(): string;
  getLogo(): { imgUrl?: string; text?: string };
  getUserInfo(): UserInfo;
  setSiteSettings(settings: Record<string, any>): void;
  setUserInfo(userInfo: Partial<UserInfo>): void;
}
