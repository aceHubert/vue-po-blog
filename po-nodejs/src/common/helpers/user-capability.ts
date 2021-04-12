/**
 * 角色权限
 */
export enum UserCapability {
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
  CreatePosts = 'create_posts',
  EditPosts = 'edit_posts', // 编辑文章
  EditOthersPosts = 'edit_others_post', // 编辑别人的文章
  EditPublishedPosts = 'edit_published_posts', // 编辑发布的文章
  EditPrivatePosts = 'edit_private_posts', // 编辑别人的私有文章
  DeletePosts = 'delete_posts',
  DeleteOthersPosts = 'delete_others_posts',
  DeletePublishedPosts = 'delete_published_posts',
  DeletePrivatePosts = 'delete_private_posts',
  PublishPost = 'publish_post', // 发布文章
  ModerateComments = 'moderate_comments', // 修改评论

  // pages
  CreatePages = 'create_pages',
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