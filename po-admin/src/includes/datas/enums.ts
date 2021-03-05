/**
 * 需要在 types 文件夹中引用
 */

export enum PostStatus {
  Draft = 'Draft',
  Publish = 'Publish',
  Private = 'Private',
  Trash = 'Trash',
}

export enum PostCommentStatus {
  Enable = 'Enable',
  Disable = 'Disabled',
}

export enum PageStatus {
  Draft = 'Draft',
  Publish = 'Publish',
  Private = 'Private',
  Trash = 'Trash',
}

export enum TermTaxonomy {
  Tag = 'tag',
  Category = 'category',
}

export enum UserStatus {
  Disabled = 'Disabled',
  Enable = 'Enable',
}

export enum UserRole {
  Administrator = 'Administrator',
  Editor = 'Editor',
  Author = 'Author',
  Contributor = 'Contributor',
  Subscriber = 'Subscriber',
}
