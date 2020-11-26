export type Theme = {
  primary: string;
  secondary: string;
  accent: string;
  anchor: string;
  error: string;
  info: string;
  success: string;
  warning: string;
  [key: string]: string;
};

export type UserInfo = {
  name: string;
  avatar?: string;
  email?: string;
  introduction?: string;
};

type ModuleConfig = {
  moduleName: string;
  entry: string;
  styles?: string | string[];
  args?: Record<string, any>;
};

export interface SiteApi {
  getConfigs(): Promise<Record<string, any>>;
  getTheme(): Promise<{ dark: boolean; themes: Partial<Theme> }>;
  getUserInfo(): Promise<Partial<UserInfo>>;
  getThemeModule(): Promise<ModuleConfig>;
  getPluginModules(): Promise<ModuleConfig[]>;
}
