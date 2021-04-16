export enum PostStatus {
  Draft = 'Draft', // 草稿
  Pending = 'Pending', // 待审核发布
  Publish = 'Publish', // 发布
  Private = 'Private', // 私有
  Trash = 'Trash', // 回收站
}

export enum PostVisibility {
  Private,
  Public,
}

export enum PostCommentStatus {
  Enable = 'Enable',
  Disable = 'Disabled',
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
