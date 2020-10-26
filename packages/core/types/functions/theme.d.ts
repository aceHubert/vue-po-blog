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

export type Themes = {
  light: Theme;
  dark: Theme;
};

export interface ThemeFunctions {
  isDarkTheme(): boolean;
  setDarkTheme(dark?: boolean): void;
  getCurrentTheme(): Theme;
  getThemes(): Themes;
  setThemes(themes: Partial<Themes>): void;
  setThemes(dark: boolean, themes: Partial<Theme>): void;
  genCssStyles(): string;
}
