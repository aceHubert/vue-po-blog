import Vue from 'vue';
import Merge from 'lodash.merge';

// Types
import { Theme, Themes } from 'types/functions/theme';

const globalThemeArgs: {
  dark: boolean;
  themes: Themes;
} = Vue.observable({
  dark: false,
  themes: {
    light: {
      primary: '#1976D2',
      secondary: '#424242',
      accent: '#82B1FF',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
    dark: {
      primary: '#2196F3',
      secondary: '#424242',
      accent: '#FF4081',
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
export function isDark() {
  return globalThemeArgs.dark;
}

/**
 * @author Huber
 * @since 2020-09-04
 * 设置主题
 * @param dark 深色主题
 */
export function setDark(dark = false) {
  globalThemeArgs.dark = dark;
}

/**
 * @author Huber
 * @since 2020-09-04
 * 获取当前主题配置
 */
export function getCurrentTheme(): Theme {
  return globalThemeArgs.themes[globalThemeArgs.dark ? 'dark' : 'light'];
}

/**
 * @author Huber
 * @since 2020-09-04
 * 获取主题配置
 */
export function getThemes(): Themes {
  return globalThemeArgs.themes;
}

/**
 * @author Huber
 * @since 2020-09-04
 * 设置主题
 */
export function setTheme(themes: Themes) {
  globalThemeArgs.themes = Merge({}, globalThemeArgs, themes);
}
