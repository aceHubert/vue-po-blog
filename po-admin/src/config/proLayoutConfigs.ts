/**
 * @ant-design-vue/pro-layout 配置文件
 */
import LogoSvg from '@/assets/images/logo.svg?inline';

// save to cookie
export const ACCESS_TOKEN = 'po_access_token';
export const REFRESH_TOKEN = 'po_refresh_token';
export const LOCALE = 'po_locale';

// save to localStorage
export const SET_LAYOUT = 'LAYOUT';
export const SET_THEME = 'THEME';
export const SET_PRIMARY_COLOR = 'PRIMARY_COLOR';
export const SET_CONTENT_WIDTH = 'CONTENT_WIDTH';
export const TOGGLE_FIXED_HEADER = 'FIXED_HEADER';
export const TOGGLE_FIX_SIDEBAR = 'FIX_SIDEBAR';
export const TOGGLE_SIDE_COLLAPSED = 'SIDE_COLLAPSED';
export const TOGGLE_COLOR_WEAK = 'COLOR_WEAK';
export const TOGGLE_AUTO_HIDE_HEADER = 'AUTO_HIDE_HEADER';
export const TOGGLE_MULTI_TAB = 'MULTI_TAB';

export enum ContentWidth {
  Fluid = 'Fluid',
  Fixed = 'Fixed',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum Layout {
  sideMenu = 'sidemenu',
  topMenu = 'topmenu',
}

export default {
  pwa: false,
  // iconfontUrl: '',

  /**
   *  默认配置
   * layout - 整体布局方式 'sidemenu' | 'topmenu'
   * primaryColor - 默认主题色, 如果修改颜色不生效，请清理 localStorage
   * theme - 主题 'dark' | 'light'
   * contentWidth - 内容区布局： Fluid |  Fixed
   * fixedHeader - 固定 Header : boolean
   * fixSiderbar - 固定左侧菜单栏 ： boolean
   * sideCollapsed - siderbar 展开状态 在 layout 为 'sidemenu' 时有效： boolean
   * colorWeak - 色盲模式： boolean
   * autoHideHeader - 向下滚动时，隐藏 Header ： boolean
   * multiTab - 多 tab 页模式： boolean
   */
  settings: {
    title: 'Plumemo Admin',
    logo: LogoSvg,
    layout: Layout.sideMenu,
    theme: Theme.Dark,
    primaryColor: '#355c7d',
    contentWidth: ContentWidth.Fluid,
    fixedHeader: true,
    fixSiderbar: true,
    colorWeak: false,
    sideCollapsed: false,
    autoHideHeader: false,
    multiTab: false,
  },

  // umi_plugin_ant_themeVar
  themeVar: [
    {
      key: 'dark',
      fileName: 'dark.css',
      theme: 'dark',
    },
    {
      key: '#F5222D',
      fileName: '#F5222D.css',
      modifyVars: {
        '@primary-color': '#F5222D',
      },
    },
    {
      key: '#FA541C',
      fileName: '#FA541C.css',
      modifyVars: {
        '@primary-color': '#FA541C',
      },
    },
    {
      key: '#FAAD14',
      fileName: '#FAAD14.css',
      modifyVars: {
        '@primary-color': '#FAAD14',
      },
    },
    {
      key: '#13C2C2',
      fileName: '#13C2C2.css',
      modifyVars: {
        '@primary-color': '#13C2C2',
      },
    },
    {
      key: '#52C41A',
      fileName: '#52C41A.css',
      modifyVars: {
        '@primary-color': '#52C41A',
      },
    },
    {
      key: '#2F54EB',
      fileName: '#2F54EB.css',
      modifyVars: {
        '@primary-color': '#2F54EB',
      },
    },
    {
      key: '#722ED1',
      fileName: '#722ED1.css',
      modifyVars: {
        '@primary-color': '#722ED1',
      },
    },

    {
      key: '#F5222D',
      theme: 'dark',
      fileName: 'dark-#F5222D.css',
      modifyVars: {
        '@primary-color': '#F5222D',
      },
    },
    {
      key: '#FA541C',
      theme: 'dark',
      fileName: 'dark-#FA541C.css',
      modifyVars: {
        '@primary-color': '#FA541C',
      },
    },
    {
      key: '#FAAD14',
      theme: 'dark',
      fileName: 'dark-#FAAD14.css',
      modifyVars: {
        '@primary-color': '#FAAD14',
      },
    },
    {
      key: '#13C2C2',
      theme: 'dark',
      fileName: 'dark-#13C2C2.css',
      modifyVars: {
        '@primary-color': '#13C2C2',
      },
    },
    {
      key: '#52C41A',
      theme: 'dark',
      fileName: 'dark-#52C41A.css',
      modifyVars: {
        '@primary-color': '#52C41A',
      },
    },
    {
      key: '#2F54EB',
      theme: 'dark',
      fileName: 'dark-#2F54EB.css',
      modifyVars: {
        '@primary-color': '#2F54EB',
      },
    },
    {
      key: '#722ED1',
      theme: 'dark',
      fileName: 'dark-#722ED1.css',
      modifyVars: {
        '@primary-color': '#722ED1',
      },
    },
  ],

  // locale
  locale: {
    default: 'en-US',
    supportLanguages: [
      {
        name: 'English',
        shortName: 'EN',
        icon: '🇺🇸',
        locale: 'en-US',
        alternate: 'en',
      },
      {
        name: '简体中文',
        shortName: '中',
        icon: '🇨🇳',
        locale: 'zh-CN',
      },
    ],
  },
};
