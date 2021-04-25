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
