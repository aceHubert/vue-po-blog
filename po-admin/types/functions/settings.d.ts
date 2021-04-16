import { UserCapability } from 'src/includes/datas';

/**
 * 1、capabilities 没有设置则表示无权限判断
 * 2、包含任意一个即可
 * 3、根目录无权限，子目录不显示
 * 4、children 长度为0时，根目录不显示
 */
export type Menu = {
  name: string;
  title: string;
  icon?: string;
  capabilities?: UserCapability[];
  children?: Array<Omit<Menu, 'children'>>;
};

export type SiteSettings = {
  baseUrl: string;
  basePath: string;
};

export interface SettingsFunctions {
  getBaseUrl(): string;
  getBasePath(): string;
  getApiPath(): string;
  getGraphqlPath(): string;
  getGraphqlWsPath(): string;
}
