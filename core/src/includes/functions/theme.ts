import Vue from 'vue';
import merge from 'lodash.merge';

// Types
import { Theme, Themes } from 'types/functions/theme';

export const globalThemes: {
  dark: boolean;
  themes: Themes;
} = Vue.observable({
  dark: false,
  themes: {
    light: {
      primary: '#1976D2',
      secondary: '#424242',
      accent: '#82B1FF',
      anchor: '#393E46',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
    dark: {
      primary: '#41444b',
      secondary: '#424242',
      accent: '#FF4081',
      anchor: '#EEEEEE',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
  },
});

/**
 * @author Hubert
 * @since 2020-09-04
 * 是否深色主题
 */
export function isDarkTheme() {
  return globalThemes.dark;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * 设置主题
 * @param dark 深色主题
 */
export function setDarkTheme(dark = true) {
  globalThemes.dark = dark;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * 获取当前主题配置
 */
export function getCurrentTheme(): Theme {
  return globalThemes.themes[globalThemes.dark ? 'dark' : 'light'];
}

/**
 * @author Hubert
 * @since 2020-09-04
 * 获取主题配置
 */
export function getThemes(): Themes {
  return globalThemes.themes;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * 设置主题
 */
export function setThemes(themes: Partial<Themes>): void;
export function setThemes(dark: boolean, themes: Partial<Theme>): void;
export function setThemes(dark: boolean | Partial<Themes>, themes?: Partial<Theme>) {
  if (typeof dark === 'boolean') {
    globalThemes.themes[dark ? 'dark' : 'light'] = merge(
      {},
      globalThemes.themes[dark ? 'dark' : 'light'],
      themes,
    ) as Theme;
  } else {
    const themes = dark;
    globalThemes.themes = merge({}, globalThemes, themes) as Themes;
  }
}

/**
 * @author Hubert
 * @since 2020-09-04
 * 生成 css variables
 */
export function genCssVariables() {
  const current = getCurrentTheme();
  const variables = Object.keys(current)
    .map((key) => `--color-${key}:${current[key]}`)
    .join(';');
  return `:root{${variables}}`;
}
