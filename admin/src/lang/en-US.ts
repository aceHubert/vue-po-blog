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

  // 内部组件
  sTable: {
    sum: ' Sum',
    selected: 'Selected',
    clear: 'Clear',
  },
  avatarDropdown: {
    user: {
      center: 'User Center',
      settings: 'Settings',
      logout: 'Logout',
    },
    dialog: {
      logout: {
        title: '@:common.dialog.title.tip',
        content: 'Do you really log-out.',
      },
    },
  },
};

const locale = {
  // setting-drawer
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
    dashboard: 'Dashboard',
    article: {
      root: 'Article',
      articles: 'All Articles',
      create: 'New Article',
      tags: 'Tags',
      categories: 'Categories',
    },
    media: {
      root: 'Media',
      medias: 'Medias',
      create: 'New Media',
    },
    page: {
      root: 'Page',
      pages: 'All Pages',
      create: 'New Page',
    },
    theme: {
      root: 'Theme',
      themes: 'Themes',
      customize: 'Cuztomize',
      color: 'Color',
      widgets: 'Widgets',
    },
    plugin: {
      root: 'Plugin',
      plugins: 'Plugins',
      installed: 'Installed',
    },
    tools: {
      root: 'Tools',
      import: 'Import',
      export: 'Export',
    },
    settings: {
      root: 'Settings',
      general: 'General',
    },
  },

  // 文章
  article: {
    status: {
      all: 'All', // 仅用于搜索
      draft: 'Draft',
      published: 'Published',
    },
    search: {
      title: 'Title',
      titlePlaceholder: 'Input @.lower:article.search.title',
      status: 'Status',
      statusPlaceholder: 'Choose @.lower:article.search.status',
    },
    column: {
      title: 'Title',
      summary: 'Summary',
      status: 'Status',
      views: 'Views',
      createTime: 'CreateTime',
      actions: 'Actions',
    },
    dialog: {
      delete: {
        content: 'Do you really want to delete this article?',
        okBtn: '@:common.btn.ok',
        cancelBtn: '@:common.btn.no',
      },
    },
    btn: {
      edit: '@:common.btn.edit',
      delete: '@:common.btn.delete',
      publish: 'Publish',
      draft: 'Draft',
    },
  },

  // 常规
  common: {
    dialog: {
      title: {
        tip: 'Message',
        comfirm: 'Confirm',
      },
      content: {
        create: 'Update successful!',
        update: 'Update successful!',
        delete: 'Delete successful!',
        error: 'Error, please try later!',
      },
      btn: {
        ok: '@:common.btn.ok',
        no: '@:common.btn.no',
        cancel: '@:common.btn.cancel',
        confirm: '@:common.btn.confirm',
      },
    },
    placeholder: {
      input: 'Input {field}',
      choose: 'Choose {field}',
    },
    btn: {
      ok: 'Ok',
      no: 'No',
      cancel: 'Cancel',
      confirm: 'Confirm',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      reset: 'Reset',
      expand: 'Expand',
      collapse: 'Collapse',
    },
  },

  // 错误消息
  error: {
    404: 'Page not found',
    500: 'System error',

    // plugins error
    modulesLoadError: 'Modules load error',
  },
};

export default {
  name: 'English',
  ...components,
  ...locale,
};
