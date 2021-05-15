import LogoSvg from '@/assets/images/logo.svg?inline';

// Types
import { LangConfig } from 'types/configs/locale';
import { LayoutConfig } from 'types/configs/layout';

// save to cookie
export const ACCESS_TOKEN = 'po_access_token';
export const REFRESH_TOKEN = 'po_refresh_token';
export const LOCALE = 'po_locale';

export enum ContentWidth {
  Fluid = 'fluid',
  Fixed = 'fixed',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  RealDark = 'realdark',
}

export enum Layout {
  SideMenu = 'sidemenu',
  TopMenu = 'topmenu',
}

export const defaultSettings: {
  layout: LayoutConfig;
  locale: {
    default: string;
    supportLanguages: LangConfig[];
  };
} = {
  // pwa: false,
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
  layout: {
    title: 'Plumemo Admin',
    logo: LogoSvg,
    layout: Layout.SideMenu,
    theme: Theme.Dark,
    primaryColor: '#355c7d',
    contentWidth: ContentWidth.Fluid,
    fixedHeader: true,
    fixSiderbar: true,
    colorWeak: false,
    autoHideHeader: false,
    multiTab: false,
  },

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
