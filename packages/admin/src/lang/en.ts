/**
 * English
 */
// @ts-ignore
import antdEnUS from 'ant-design-vue/es/locale-provider/en_US';
// @ts-ignore
import momentEU from 'moment/locale/eu';

const components = {
  antLocale: antdEnUS,
  momentName: 'eu',
  momentLocale: momentEU,
};

const locale = {
  message: '-',

  'layouts.userment.user.center': 'User',
  'layouts.userment.user.settings': 'Settings',
  'layouts.userment.user.logout': 'Logout',
  'layouts.usermenu.dialog.title': 'Message',
  'layouts.usermenu.dialog.content': 'Do you really log-out.',

  'app.setting.pagestyle': 'Page style setting',
  'app.setting.pagestyle.light': 'Light style',
  'app.setting.pagestyle.dark': 'Dark style',
  'app.setting.pagestyle.realdark': 'RealDark style',
  'app.setting.themecolor': 'Theme Color',
  'app.setting.navigationmode': 'Navigation Mode',
  'app.setting.content-width': 'Content Width',
  'app.setting.fixedheader': 'Fixed Header',
  'app.setting.fixedsidebar': 'Fixed Sidebar',
  'app.setting.sidemenu': 'Side Menu Layout',
  'app.setting.topmenu': 'Top Menu Layout',
  'app.setting.content-width.fixed': 'Fixed',
  'app.setting.content-width.fluid': 'Fluid',
  'app.setting.othersettings': 'Other Settings',
  'app.setting.weakmode': 'Weak Mode',
  'app.setting.copy': 'Copy Setting',
  'app.setting.loading': 'Loading theme',
  'app.setting.copyinfo': 'copy success，please replace defaultSettings in src/models/setting.js',
  'app.setting.production.hint': 'Setting panel shows in development environment only, please manually modify',

  // 菜单
  menu: {
    home: 'Home',
    dashboard: 'Dashboard',
    article: 'Article',
    media: 'Media',
    page: 'Page',
    lib: 'Lib',
    theme: {
      root: 'Theme',
      color: 'Color',
    },
  },

  // 文章
  article: {
    status: {
      draft: ' Draft',
      published: 'Published',
    },
  },
};

export default {
  name: 'English',
  ...components,
  ...locale,
};
