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
      profile: '用户信息',
      settings: '设置',
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
    bulkApplyBtnTitle: '@:searchForm.bulkApplyBtnText',
    itemCount: '{count}行',
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
      tags: '标签',
      categories: '分类',
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

  // 页面标题
  pageTitle: {
    user: {
      index: '用户',
      create: '新建用户',
      edit: '编辑用户',
      profile: '用户信息',
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
      settingsTitle: '设置',
      title: '文章标题',
      titlePlaceholder: '请输入@:post.form.title',
      titleRequired: '@:post.form.title必填',
      excerpt: '摘要',
      excerptHelp: '写一段简单的摘要（选填）',
      excerptPlaceholder: '请输入文章摘要',
      thumbnail: '封面图',
      tagTitle: '标签',
      tagPlaceholder: '请选择/输入标签',
      tagManagementLinkText: '标签管理',
      categoryTitle: '分类',
      addCategoryLinkText: '添加分类',
      discusionTitle: '评论',
      allowCommentCheckboxText: '允许评论',
      contentPlaceholder: '编辑文章内容',
    },
    tips: {
      bulkRowReqrired: '@:common.tips.bulkRowReqrired',
      trashStatusEdit: '文章在垃圾箱中，请先恢复后再操作！',
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
      switchToDraft: '切换到草稿箱',
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
      switchToDraft: '切换文章到草稿箱',
    },
  },

  tag: {
    search: {
      keywordPlaceholder: '搜索标签',
      bulkDeleteAction: '删除',
    },
    column: {
      name: '名称',
      slug: '别名',
      description: '描述',
      count: '数量',
    },
    form: {
      creationModelTitle: '新建标签',
      updateModelTitle: '修改标签',
      name: '标签名称',
      namePlaceholder: '请输入分类名称',
      nameRequired: '@:tag.form.name必填',
      nameHelp: '标签名称会显示在您的网站上。',
      slug: '别名',
      slugPlaceholder: '请输入别名',
      slugHelp: '"别名"是在URL中友好的显示标签名称，通常为英文字母组成。',
      description: '描述',
      descriptionPlaceholder: '请输入描述',
      descriptionHelp: '对标签作一段简短的描述',
    },
    tips: {
      bulkRowReqrired: '@:common.tips.bulkRowReqrired',
    },
    btnText: {
      create: '新建标签',
      update: '修改标签',
      edit: '@:common.btnText.edit',
      delete: '@:common.btnText.delete',
      deletePopOkBtn: '@:common.btnText.ok',
      deletePopCancelBtn: '@:common.btnText.no',
    },
    btnTips: {
      create: '@:tag.btnText.create',
      update: '@:tag.btnText.update',
      edit: '@:tag.btnText.edit',
      delete: '永久删除这条标签',
      deletePopContent: '确定永久删除这条标签吗？',
    },
  },

  category: {
    search: {
      keywordPlaceholder: '搜索分类',
      bulkDeleteAction: '删除',
    },
    column: {
      name: '名称',
      slug: '别名',
      description: '描述',
      count: '数量',
    },
    form: {
      creationModelTitle: '新建分类',
      updateModelTitle: '修改分类',
      name: '分类名称',
      namePlaceholder: '请输入分类名称',
      nameRequired: '@:category.form.name必填',
      nameHelp: '分类名称会显示在您的网站上。',
      slug: '别名',
      slugPlaceholder: '请输入别名',
      slugHelp: '"别名"是在URL中友好的显示分类名称，通常为英文字母组成。',
      parent: '父级分类',
      parentPlaceholder: '请选择父级分类',
      parentHelp: '父级分类',
      description: '描述',
      descriptionPlaceholder: '请输入描述',
      descriptionHelp: '对分类作一段简短的描述',
    },
    tips: {
      bulkRowReqrired: '@:common.tips.bulkRowReqrired',
    },
    btnText: {
      create: '新建分类',
      update: '修改分类',
      edit: '@:common.btnText.edit',
      delete: '@:common.btnText.delete',
      deletePopOkBtn: '@:common.btnText.ok',
      deletePopCancelBtn: '@:common.btnText.no',
    },
    btnTips: {
      create: '@:category.btnText.create',
      update: '@:category.btnText.update',
      edit: '@:category.btnText.edit',
      delete: '永久删除这条标签',
      deletePopContent: '确定永久删除这条标签吗？',
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
      bulkDeleteAction: '删除',
    },
    column: {
      username: '用户名',
      name: '显示名',
      mobile: '手机号码',
      email: '电子邮箱',
      role: '角色',
      createTime: '创建时间',
    },
    form: {
      groupName: '姓名',
      groupContactInfo: '个人信息',
      groupAboutYourself: '关于您',
      groupPersonalOptions: '个人设置',
      groupAccountManagement: '账号管理',
      username: '用户名',
      usernamePlaceholder: '请输入用户名',
      usernameRequired: '用户名必填！',
      usernameMinLengthError: '用户名至少{min}个字符！',
      usernameHasExisted: '用户名"{value}"已在在！',
      usernameEditHelp: '用户名不可被修改。',
      password: '登录密码',
      passwordPlaceholder: '请输入登录密码',
      passwordRequired: '登录密码必填',
      passwordMinLengthError: '登录密码至少{min}个字符！',
      passwordEditHelp: '如果继续使用旧密码，请留空即可。',
      email: '电子邮件',
      emailPlaceholder: '请输入电子邮件',
      emailRequired: '电子邮件必填！',
      emailFormatError: '电子邮件格式不正确！',
      emailHasExisted: '电子邮件"{value}"已在在！',
      emailEditHelp: '如果您修改此项，我们会向您的新地址寄送电子邮件来确认。',
      mobile: '手机号码',
      mobilePlaceholder: '请输入手机号码',
      mobileLengthError: '手机号码长度不正确！',
      mobileHasExisted: '手机号码"{value}"已在在！',
      firstName: '名',
      firstNamePlaceholder: '请输入名',
      lastName: '姓氏',
      lastNamePlaceholder: '请输入姓氏',
      nickname: '别名',
      nicknamePlaceholder: '请输入别名',
      nicknameRequired: '别名必填',
      displayName: '公开显示为',
      website: '站点',
      websitePlaceholder: '请输入站点',
      websiteFormatError: '站点格式不正确',
      language: '语言',
      languageSiteDefaultOptionText: '站点默认语言',
      description: '自我简介',
      descriptionPlaceholder: '简短的介绍您自己',
      avator: '头像',
      adminColor: '管理界面配色文案',
      userRole: '角色',
      noneUserRoleOption: '此站点上没有任何用户角色',
      sendUserNotification: '发送用户通知',
      sendUserNotificationCheckboxText: '向新用户发送有关账户详情的电子邮件。',
    },
    tips: {
      updateSuccess: '修改成功',
      updateFailed: '修改用户信息发生错误，请稍后重试！',
    },
    btnText: {
      createUser: '创建用户',
      updateUser: '更新用户',
      updateProfile: '更新个人资料',
      edit: '@:common.btnText.edit',
      save: '@:common.btnText.save',
      delete: '删除',
      deletePopOkBtn: '@:common.btnText.ok',
      deletePopCancelBtn: '@:common.btnText.no',
    },
    btnTips: {
      createUser: '@:user.btnText.createUser',
      updateUser: '@:user.btnText.updateUser',
      updateProfile: '@:user.btnText.updateProfile',
      edit: '@:user.btnText.edit',
      save: '@:user.btnText.save',
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
    tips: {
      required: '必填',
      bulkRowReqrired: '请选择至少一行数据',
    },
    placeholder: {
      input: '请输入{field}',
      choose: '请选择{field}',
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
    unauthorized: '抱歉，您没有权限访问此站点。',
    pageNotFound: '页面未找到！',
    serverError: '系统错误，请稍后重试！',
    noCapability: '抱歉，您没有权限操作此页面！',

    // plugins error
    loadModuleFailed: '模块加载失败',
  },
};

export default {
  name: '简体中文',
  ...components,
  ...locale,
};
