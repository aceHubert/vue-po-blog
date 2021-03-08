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

  // 内部组件
  asyncTable: {
    sum: '总计',
    selected: '已选择',
    clear: '清除',
  },
  avatarDropdown: {
    user: {
      center: '个人中心',
      settings: '用户设置',
      logout: '退出登录',
    },
    dialog: {
      logout: {
        title: '@:common.dialog.title.tip',
        content: '确认退出吗？',
        okText: '@:common.btnText.ok',
        cancelText: '@:common.btnText.no',
      },
    },
  },
  searchForm: {
    keywordPlaceholder: '关键字',
    bulkActionPlaceholder: '批量操作',
    bulkApplyBtnText: '应用',
    itemCountLable: '行',
  },
};

const locale = {
  // 菜单
  menu: {
    dashboard: '仪表盘',
    post: {
      root: '文章',
      posts: '所有文章',
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
      root: '外观',
      libs: '主题',
      customize: '自定义',
      widgets: '小组件',
      menu: '菜单',
    },
    plugin: {
      root: '插件',
      installed: '已安装的插件',
      add: '安装插件',
    },
    user: {
      root: '用户',
      users: '所有用户',
      create: '新建用户',
    },
    tools: {
      root: '工具',
      import: '导入',
      export: '导出',
    },
    settings: {
      root: '设置',
      general: '常规',
    },
  },

  // 面包屑导航
  breadcrumb: {
    dashboard: '@:menu.dashboard',
    allPosts: '@:menu.post.posts',
    posts: '@:menu.post.root',
    tags: '标签',
    categories: '分类',
    allPages: '@:menu.page.pages',
    pages: '@:menu.page.root',
    allMedias: '@:menu.media.medias',
    medias: '@:menu.media.root',
    themes: '@:menu.theme.root',
    themeLibs: '主题库',
    themeCustomize: '@:menu.theme.customize',
    menu: '@:menu.theme.menu',
    widgets: '@:menu.theme.widgets',
    plugins: '@:menu.plugin.add',
    installedPlugins: '@:menu.plugin.installed',
    allUsers: '@:menu.user.users',
    users: '@:menu.user.root',
    tools: '@:menu.tools.root',
    import: '@:menu.tools.import',
    export: '@:menu.tools.export',
    generalSettings: '@:menu.settings.general设置',

    new: '新建',
    create: '@:breadcrumb.new',
    edit: '编辑',
    update: '@:breadcrumb.edit',
  },

  // 登录
  login: {
    title: '欢迎登录Plumemo管理平台',
    description: '一个简单的前后端分离博客系统',
    usernamePlaceholder: '用户名/邮箱',
    usernameRequired: '请输入用户名！',
    passwordPlaceholder: '密码',
    passwordRequired: '请输入密码',
    btnLogin: '登录',
  },

  // 文章
  post: {
    status: {
      all: '全部', // 仅用于搜索
      draft: '草稿',
      publish: '已发布',
      private: '私有',
      trash: '垃圾箱',
    },
    search: {
      keywordPlaceholder: '搜索文章',
      allDates: '所有日期',
      allCategories: '所有分类',
      bulkEditAction: '编辑',
      bulkTrashAction: '移至垃圾箱',
      filterBtnText: '过滤',
    },
    column: {
      title: '标题',
      author: '作者',
      commentCount: '评论数量',
      createTime: '创建时间',
    },
    form: {
      title: '文章标题',
      titlePlaceholder: '请输入@:post.form.title',
      author: '作者',
      authorPlaceholder: '请输入@:post.form.author',
      summary: '文章描述',
      summaryPlaceholder: '请输入@:post.form.summary',
      thumbnail: '封面图',
      tag: '标签',
      tagPlaceholder: '请选择@:post.form.tag',
      category: '分类',
      categoryPlaceholder: '请选择@:post.form.category',
      content: '文章内容',
      contentPlaceholder: '编辑@:post.form.content',
    },
    btnText: {
      edit: '@:common.btnText.edit',
      update: '@:common.btnText.update',
      save: '@:common.btnText.save',
      saveToDraft: '保存到草稿箱',
      delete: '永久删除',
      deletePopOkBtn: '@:common.btnText.ok',
      deletePopCancelBtn: '@:common.btnText.no',
      publish: '发布',
      upload: '点击上传',
      preview: '预览',
      restore: '重置',
      moveToDraft: '移至草稿箱',
      moveToTrash: '移至垃圾箱',
    },
    btnTips: {
      edit: '@:post.btnText.edit',
      update: '@:post.btnText.update',
      save: '保存文章并发布',
      saveToDraft: '保存文章到草稿箱',
      delete: '@:post.btnText.delete',
      deletePopContent: '确定永久删除这篇文章吗？',
      reset: '@:post.btnText.reset',
      back: '@:post.btnText.back',
      publish: '@:post.btnText.publish',
      preview: '@:post.btnText.preview',
      restore: '@:post.btnText.restore',
      moveToDraft: '@:post.btnText.moveToDraft',
      moveToTrash: '@:post.btnText.moveToTrash',
    },
  },

  // 用户
  user: {
    role: {
      all: '全部', // 仅用于搜索
      administrator: '管理员',
      editor: '编辑',
      author: '作者',
      contributor: '贡献者',
      subscriber: '订阅者',
      none: '无',
      noneFullName: '无角色',
    },
    search: {
      keywordPlaceholder: '搜索用户',
    },
    column: {
      loginName: '登录名',
      name: '显示名',
      mobile: '手机号码',
      email: '电子邮箱',
      role: '角色',
      createTime: '创建时间',
    },
    btnText: {
      edit: '@:common.btnText.edit',
      delete: '删除',
      deletePopOkBtn: '@:common.btnText.ok',
      deletePopCancelBtn: '@:common.btnText.no',
    },
    btnTips: {
      edit: '@:user.btnText.edit',
      delete: '@:user.btnText.delete',
      deletePopContent: '确定永久删除此用户吗？',
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
        ok: '@:common.btnText.ok',
        no: '@:common.btnText.no',
        cancel: '@:common.btnText.cancel',
        confirm: '@:common.btnText.confirm',
      },
    },
    placeholder: {
      input: 'Input {field}',
      choose: 'Choose {field}',
    },
    btnText: {
      ok: '是',
      yes: '@:common.btnText.ok',
      no: '否',
      cancel: '取消',
      confirm: '确认',
      create: '新建',
      edit: '编辑',
      update: '修改',
      save: '保存',
      delete: '删除',
      search: '搜索',
      reset: '重置',
      expand: '展开',
      collapse: '收起',
      upload: '上传',
      back: '返回',
    },
  },

  // 错误消息
  error: {
    401: '抱歉，您不能访问此页面。',
    404: '页面未找到！',
    500: '系统错误，请稍后重试！',
    description: '在页面渲染时发生错误，请在开发者工具中查询详细信息！',

    // plugins error
    loadModuleFailed: '模块加载失败',
  },
};

export default {
  name: '简体中文',
  ...components,
  ...locale,
};
