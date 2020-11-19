/**
 * 中文
 */
// @ts-ignore
import antd from 'ant-design-vue/es/locale-provider/zh_CN';
// @ts-ignore
import momentCN from 'moment/locale/zh-cn';

const components = {
  antLocale: antd,
  momentName: 'zh-cn',
  momentLocale: momentCN,
};

const locale = {
  message: '-',

  // layouts
  'layouts.userment.user.center': '用户中心',
  'layouts.userment.user.settings': '用户设置',
  'layouts.userment.user.logout': '退出登录',
  'layouts.usermenu.dialog.title': '提示',
  'layouts.usermenu.dialog.content': '确认退出吗？',

  // 菜单
  menu: {
    home: '主页',
    dashboard: '仪表盘',
    article: '文章',
    media: '媒体',
    page: '页面',
    lib: '库',
    theme: {
      root: '主题',
      color: '主题色配置',
    },
    plugin: {
      root: '插件',
      install: '已安装插件',
      plugins: '插件广场',
    },
  },

  // 文章
  article: {
    status: {
      draft: '草稿',
      published: '已发布',
    },
  },
};

export default {
  name: '中文',
  ...components,
  ...locale,
};
