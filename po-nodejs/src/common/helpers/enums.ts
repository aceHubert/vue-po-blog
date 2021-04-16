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
  Draft = 'draft', // 草稿
  Pending = 'pending', // 待审核发布
  Publish = 'publish', // 已发布
  Private = 'private', // 私有
  // Future = 'future', // 预约发布
  Trash = 'trash', // 垃圾箱
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
