export enum OptionKeys {
  /** 静态资源 base URL地址 */
  SiteUrl = 'siteurl',
  /** web URL 地址 */
  Home = 'home',
  /** 博客名称 */
  BlogName = 'blog_name',
  /** 博客简介 */
  BlogDescription = 'blog_description',
  /** 是否支持用户注册，值：off/on，默认：off */
  UsersCanRegister = 'users_can_register',
  /** 管理员邮箱地址 */
  AdminEmail = 'admin_email',
  /** 一周从哪天开始，值：1-7，默认：1 */
  StartOfWeek = 'start_of_week',
  /** 日期格式化，默认：MMM D,YYYY, 参考 https://momentjs.com/docs/#/displaying/format/ */
  DateFormat = 'date_format',
  /** 日间格式化，默认：h:mm a， 参考 https://momentjs.com/docs/#/displaying/format/ */
  TimeFormat = 'time_format',
  /** 时区，默认： UTC+0 */
  TimezoneString = 'timezone_string',
  /** 管理界面布局（包括主题，Logo，标题等） */
  AdminLayout = 'admin_layout',
  /** email 服务器配置 */
  MailServerUrl = 'mailserver_url',
  MailServerLogin = 'mailserver_login',
  MailServerPass = 'mailserver_pass',
  MailServerPort = 'mailserver_port',
  /** 永久链接显示方式 */
  PermalinkStructure = 'permalink_structure',
  /** 文章默认分类id */
  DefaultCategory = 'default_category',
  /** 文章默认评论状态，值：open/close，默认：open */
  DefaultCommentStatus = 'default_comment_status',
  /** 页面启用评论，值：off/on，默认：off */
  PageComments = 'page_comments',
  /** 首页显示的内容, 值：post/page，默认：post */
  ShowOnFront = 'show_on_front',
  /** 首页显示的自定义页面id（当ShowOnFort值是page）,默认：0 */
  PageOnFront = 'page_on_front',
  /** 文章列表页显示的自定义页面id，默认：0 */
  PageForPosts = 'page_for_posts',
  /** 文章分页页大小，默认：10 */
  PostsPerPage = 'posts_per_page',
  /** 评论分页页大小，默认：5 */
  CommentsPerPage = 'comments_per_page',
  /** 评论排序，值：asc/desc，默认：asc */
  CommentsOrder = 'comments_order',
  /** 评论启用嵌套, 值：off/on，默认：on */
  CommentsNested = 'comments_nested',
  /** 评论嵌套深度，默认：2 */
  CommentsNestedDepth = 'comments_nusted_depth',
  /** 当前启用的插件 */
  ActivePlugins = 'active_plugins',
  /** 当前使用的主题 */
  CurrentTheme = 'current_theme',
  /** 默认用户角色，默认：Subscriber */
  DefaultRole = 'default_role',
  /** 缩略图宽度，默认：150 */
  ThumbnailSizeWidth = 'thumbnail_size_w',
  /** 缩略图高度，默认：150 */
  ThumbnailSizeHeight = 'thumbnail_size_h',
  /** 缩略图裁切，值：0/1，默认：1 */
  ThumbnailCrop = 'thumbnail_crop',
  /** 中图宽度，默认：300 */
  MediumSizeWidth = 'medium_size_w',
  /** 中图高度，默认：300 */
  MediumSizeHeight = 'medium_size_h',
  /** 大图宽度，默认：1200 */
  LargeSizeWidth = 'large_size_w',
  /** 大图高度，默认：1200 */
  LargeSizeHeight = 'large_size_h',
  /** 中大图宽度，默认：768 */
  MediumLargeSizeWidth = 'medium_large_size_w',
  /** 中大图高度：默认：0（auto） */
  MediumLargeSizeHeight = 'medium_large_size_h',
}

// key 需要添加表前缀的keys
export enum OptionTablePrefixKeys {
  /** 用户角色配置 */
  UserRoles = 'user_roles',
  /** 默认语言 */
  Locale = 'locale',
}
