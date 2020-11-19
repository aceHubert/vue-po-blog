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
  // 菜单
  menu: {
    dashboard: '仪表盘',
    article: {
      root: '文章',
      articles: '所有文章',
      create: '新建文章',
      tags: '标签管理',
      categories: '分类管理',
    },
    media: {
      root: '媒体',
      medias: '媒体库',
      create: '新建媒体',
    },
    page: {
      root: '页面',
      pages: '所有页面',
      create: '新建页面',
    },
    theme: {
      root: '主题',
      themes: '主题库',
      customize: '自定义',
      color: '主题色配置',
      widgets: '小组件',
    },
    plugin: {
      root: '插件',
      plugins: '插件库',
      installed: '已安装插件',
    },
    tools: {
      root: '工具',
      import: '导入',
      export: '导出',
    },
    settings: {
      root: '设置',
      general: '常规',
    }
  },

  // 文章
  article: {
    status: {
      all: '全部', // 仅用于搜索
      draft: '草稿',
      published: '已发布',
    },
    search: {
      title: '标题',
      titlePlaceholder: '请输入 @:article.search.title',
      status: '文章状态',
      statusPlaceholder: '请选择 @.lower:article.search.status',
    },
    column: {
      title: '标题',
      summary: '摘要',
      status: '文章状态',
      views: '浏览数',
      createTime: '创建时间',
      actions: '操作',
    },
    dialog: {
      delete: {
        content: '确定删除这篇文章？',
        okBtn: '@:common.btn.ok',
        cancelBtn: '@:common.btn.no',
      },
    },
    btn: {
      edit: '@:common.btn.edit',
      delete: '@:common.btn.delete',
      publish: '发布',
      draft: '放入草稿箱',
    },
  },

  // 组件
  sTable: {
    sum: '总计',
    selected: '已选择',
    clear: '清除',
  },
  avatarDropdown: {
    user: {
      center: '用户中心',
      settings: '用户设置',
      logout: '退出登录',
    },
    dialog: {
      logout: {
        title: '@:common.dialog.title.tip',
        content: '确认退出吗？',
      },
    },
  },

  // 常规
  common: {
    dialog: {
      title: {
        tip: '提示',
        comfirm: '确认',
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
      ok: '是',
      no: '否',
      cancel: '取消',
      confirm: '确认',
      create: '新建',
      edit: '编辑',
      delete: '删除',
      search: '搜索',
      reset: '重置',
      expand: '展开',
      collapse: '收起',
    },
  },
};

export default {
  name: '简体中文',
  ...components,
  ...locale,
};
