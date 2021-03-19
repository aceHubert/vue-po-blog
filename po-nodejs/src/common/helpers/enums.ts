/**
 * 配置自动加载
 */
export enum OptionAutoload {
  Yes = 'yes',
  No = 'no',
}

/**
 * 用户状态
 */
export enum UserStatus {
  Disabled = 0,
  Enable = 1,
}

/**
 * 用户角色
 */
export enum UserRole {
  Administrator = 'administrator',
  Editor = 'editor',
  Author = 'author',
  Contributor = 'contributor',
  Subscriber = 'subscriber',
}

export enum UserRoleWithNone {
  Administrator = 'administrator',
  Editor = 'editor',
  Author = 'author',
  Contributor = 'contributor',
  Subscriber = 'subscriber',
  None = 'none',
}

/**
 * 角色权限
 */
export enum UserRoleCapability {
  // themes
  InstallThemes = 'install_themes',
  SwitchThemes = 'switch_themes',
  EditThemes = 'edit_themes',
  UpgradeThemes = 'upgrade_themes',
  DeleteThemes = 'delete_themes',

  // plugins
  InstallPlugins = 'install_plugins',
  ActivatePlugins = 'activate_plugins',
  EditPlugins = 'edit_plugins',
  UpgradePlguins = 'upgrade_plugins',
  DeletePlugins = 'delete_plugins',

  // users
  ListUsers = 'list_users',
  CreateUsers = 'create_users',
  EditUsers = 'edit_users',
  DeleteUsers = 'delete_users',

  // posts
  EditPosts = 'edit_posts',
  EditOthersPosts = 'edit_others_post',
  EditPublishedPosts = 'edit_published_posts',
  EditPrivatePosts = 'edit_private_posts',
  DeletePosts = 'delete_posts',
  DeleteOthersPosts = 'delete_others_posts',
  DeletePublishedPosts = 'delete_publishedPosts',
  DeletePrivatePosts = 'delete_private_posts',
  PublishPost = 'publish_post',
  ModerateComments = 'moderate_comments',

  // pages
  EditPages = 'edit_pages',
  EditOthersPages = 'edit_others_pages',
  EditPublishedPages = 'edit_published_pages',
  EditPrivatePages = 'edit_private_pages',
  DeletePages = 'delete_pages',
  DeleteOthersPages = 'delete_others_pages',
  DeletePublishedPages = 'delete_published_pages',
  DeletePrivatePages = 'delete_private_pages',
  PublishPages = 'publish_pages',

  // read
  Read = 'read',
  ReadPrivatePosts = 'read_private_posts',
  ReadPrivatePages = 'read_private_pages',

  // others
  EditFiles = 'edit_files',
  UploadFiles = 'upload_files',
  ManageOptions = 'manage_options',
  ManageCategories = 'manage_categories',
  ManageTags = 'manage_tags',
  ManageLinks = 'manage_links',
  UpgradeCore = 'upgrade_core',
  EditDashboard = 'edit_dashboard',
  Import = 'import',
  Export = 'export',
}

/**
 * 文章类型
 */
export enum PostType {
  Post = 'post',
  Page = 'page',
}

/**
 * 文章或页面状态
 */
export enum PostStatus {
  Draft = 'draft',
  Publish = 'publish',
  Private = 'private',
  Trash = 'trash',
}

/**
 * 文章评论状态
 */
export enum PostCommentStatus {
  Disabled = 'close',
  Enable = 'open',
}

/**
 * 评论类型（扩展字段）
 */
export enum CommentType {
  Comment = 'comment',
}

/**
 * 链接打开方式
 */
export enum LinkTarget {
  Blank = '_blank',
  Self = '_self',
}

/**
 * 链接是否显示
 */
export enum LinkVisible {
  Yes = 'yes',
  No = 'no',
}
