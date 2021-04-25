import { Optional } from './optional.interface';
import { PostStatus, PostCommentStatus } from '@/posts/enums';

// 仅内部使用
export enum PostOperateStatus {
  AutoDraft = 'auto draft', // 新建
  Inherit = 'inherit', // 编辑
}

// 仅内部使用
export enum PostOperateType {
  Revision = 'revision', //状态为 inherit
}

/**
 * 文章类型
 */
export enum PostType {
  Post = 'post',
  Page = 'page',
}

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
  parentId?: number;
  commentStatus: PostCommentStatus;
  commentCount: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface PostCreationAttributes
  extends Optional<
    PostAttributes,
    'id' | 'name' | 'type' | 'order' | 'parentId' | 'status' | 'commentStatus' | 'commentCount'
  > {}
