import Vue from 'vue';
import merge from 'lodash.merge';

// Types
import { ThemeFunctions, Theme, Themes } from 'types/functions/theme';

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

const themeFunctions: ThemeFunctions = {
  /**
   * @author Hubert
   * @since 2020-09-04
   * 是否深色主题
   */
  isDarkTheme: function () {
    return globalThemes.dark;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * 设置主题
   * @param dark 深色主题
   */
  setDarkTheme: function (dark = true) {
    globalThemes.dark = dark;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * 获取当前主题配置
   */
  getCurrentTheme: function () {
    return globalThemes.themes[globalThemes.dark ? 'dark' : 'light'];
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * 获取主题配置
   */
  getThemes: function () {
    return globalThemes.themes;
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * 设置主题
   */
  setThemes: function (dark: boolean | Partial<Themes>, themes?: Partial<Theme>) {
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
  },

  /**
   * @author Hubert
   * @since 2020-09-04
   * 生成 css styles
   * 注意模块字符串换行格式
   */
  genCssStyles: function () {
    const current = this.getCurrentTheme();
    const variables = `
    :root{${Object.keys(current)
      .map(
        (key) => `
      --color-${key}:${current[key]};`,
      )
      .join('')}
    }\n`;

    const basicThemes = `
    [data-app].theme--light{
      background:#fff;
      color:rgba(0,0,0,0.87);
    }\n 
    [data-app].theme--dark{
      background: #121212; 
      color:#fff;
    }\n
    a{
      color: ${current.anchor}
    }\n`;

    const colors = Object.keys(current)
      .map(
        (key) => `
    .${key}{
      background-color:${current[key]} !important;
      border-color:${current[key]} !important;
    }\n
    .${key}--text{
      color:${current[key]} !important;
    }\n`,
      )
      .join('');
    return variables + basicThemes + colors;
  },
};

export default themeFunctions;
