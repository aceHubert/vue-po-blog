import { PagerQuery, PagerResponse } from './pager';
import { PostStatus, PostCommentStatus } from 'src/includes/datas/enums';

export type Post = {
  id: number;
  title: string;
  author: { id: number; displayName: string };
  excerpt: string;
  content: string;
  status: PostStatus;
  commentStatus: PostCommentStatus;
  commentCount: number;
  createTime: Date;
};

export type PostWithoutContent = Omit<Post, 'content'>;

export type PostCreationModel = {
  title: string;
  excerpt?: string;
  content: string;
  commentStatus?: PostCommentStatus;
};

export type PostUpdateModel = Partial<
  Omit<PostCreationModel, 'author'> & {
    status: PostStatus;
  }
>;

export type PostPagerQuery = PagerQuery<{
  keywords?: string;
  author?: number;
  status?: PostStatus;
  categoryIds?: number[];
  date?: string; // yyyyMM
}>;

export type PostPagerResponse = PagerResponse<PostWithoutContent>;

export type PostArchive = {
  date: Date;
  posts: Array<PostWithoutContent>;
  total: number;
};
