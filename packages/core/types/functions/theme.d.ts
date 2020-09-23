export type Theme = {
  primary: string;
  secondary: string;
  accent: string;
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
