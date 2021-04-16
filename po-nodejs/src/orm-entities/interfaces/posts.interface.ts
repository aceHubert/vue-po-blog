import { Optional } from './optional.interface';
import { PostType, PostStatus, PostCommentStatus } from '@/common/helpers/enums';

// 仅内部使用
export enum PostOperateStatus {
  AutoDraft = 'auto draft', // 新建
  Inherit = 'inherit', // 编辑
}

// 仅内部使用
export enum PostOperateType {
  Revision = 'revision', //状态为 inherit
}

export { PostType, PostStatus, PostCommentStatus };

export interface PostAttributes {
  id: number;
  title: string;
  name: string;
  author: number;
  content: string;
  excerpt: string;
  type: PostType | PostOperateType;
  status: PostStatus | PostOperateStatus;
  order: number;
  parent?: number;
  commentStatus: PostCommentStatus;
  commentCount: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface PostCreationAttributes
  extends Optional<
    PostAttributes,
    'id' | 'name' | 'type' | 'order' | 'parent' | 'status' | 'commentStatus' | 'commentCount'
  > {}
