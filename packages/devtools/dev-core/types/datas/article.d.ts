import { PagerQuery, PagerResponse } from './request';
import { Tag } from './tag';
import { Category } from './category';

export type Article = {
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

export type ArticleWithoutContent = Omit<Article, 'content'>;

export type ArticlePagerQuery = PagerQuery<{
  from?: string; // 路由名称
  keywords?: string;
  categoryId?: number;
  tagId?: number;
}>;

export type ArticlePagerResponse = PagerResponse<ArticleWithoutContent>;

export type ArticleArchive = {
  date: Date;
  articles: Array<ArticleWithoutContent>;
  total: number;
};

export interface ArticleApi {
  getList(query?: ArticlePagerQuery): Promise<ArticlePagerResponse>;
  getCount(): Promise<number>;
  getArchive(): Promise<ArticleArchive[]>;
  get(id: number): Promise<Article>;
}
