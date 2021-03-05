export type Menu = {
  name: string;
  title: string;
  icon?: string;
  children?: SubMenu[];
};

export type SubMenu = {
  name: string;
  title: string;
  icon?: string;
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
