export enum OptionKeys {
  SiteUrl = 'siteurl', //资源文件 baseUrl
  Home = 'home', // 前端显示的地址
  BlogName = 'blog_name',
  BlogDescription = 'blog_description',
  UsersCanRegister = 'users_can_register', // 是否支持用户注册, off/on
  AdminEmail = 'admin_email',
  StartOfWeek = 'start_of_week', // 1-7
  DateFormat = 'date_format', // 日期格式化，默认 Feb 2,2019. 参考 moment,
  TimeFormat = 'time_format', // 时间格式化，默认：9:08 am. 参考 moment
  TimezoneString = 'timezone_string', // 时区，默认： UTC+0
  MailServerUrl = 'mailserver_url', // email 服务器配置
  MailServerLogin = 'mailserver_login',
  MailServerPass = 'mailserver_pass',
  MailServerPort = 'mailserver_port',
  PermalinkStructure = 'permalink_structure', // 永久链接显示方式
  DefaultCategory = 'default_category', // Post 默认分类
  DefaultCommentStatus = 'default_comment_status', // Post 默认评论状态
  ShowOnFront = 'show_on_front', // 首页显示的内容, post or page
  PageForPosts = 'page_for_posts', // Posts 列表页显示的页面
  PageOnFront = 'page_on_front', // 首页显示的页面, 如果 ShowOnFort = page
  PostsPerPage = 'posts_per_page', // Post 分页数
  PageComments = 'page_comments', // Page 启用评论, off/on
  CommentsPerPage = 'comments_per_page', // 评论分页数
  CommentsOrder = 'comments_order', // 评论排序，asc or desc
  CommentsNested = 'comments_nested', // 评论启用嵌套, off/on
  CommentsNestedDepth = 'comments_nusted_depth', // 评论嵌套深度
  ActivePlugins = 'active_plugins', // 当前启用的插件
  CurrentTheme = 'current_theme', // 当前使用的主题
  DefaultRole = 'default_role', // 默认用户角色
}

// key 需要添加表前缀的keys
export enum OptionTablePrefixKeys {
  UserRoles = 'user_roles', // 用户角色配置
  Locale = 'locale', // 默认语言
}
