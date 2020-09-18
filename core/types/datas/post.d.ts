import { PagerQuery } from './request';
import { PagerInfo } from './response';
import { Tag } from './tag';
import { Category } from './category';

export type Post = {
  id: number;
  status: number;
  author: string;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  category: Category;
  comments: number;
  syncStatus: number;
  tags: Tag[];
  views: number;
  weight: number;
  createTime: Date;
};

export type PostPagerQuery = PagerQuery<{
  from?: string; // 路由名称
  keywords?: string;
  categoryId?: number;
  tagId?: number;
}>;

export type PostPagerResponse = {
  rows: Array<Omit<Post, 'content'>>;
  pager: PagerInfo;
};
