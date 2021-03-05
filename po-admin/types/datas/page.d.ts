import { PagerQuery, PagerResponse } from './pager';
import { PageStatus } from 'src/includes/datas/enums';

export type Page = {
  id: number;
  title: string;
  content: string;
  status: number;
  createTime: Date;
};

export type PageWithoutContent = Omit<Page, 'content'>;

export type CreatePageModel = {
  title: string;
  content: string;
};

export type UpdatePageModel = Partial<CreatePageModel>;

export type PagePagerQuery = PagerQuery<{
  keywords?: string;
  status?: PageStatus;
  createTime?: [string | Date | null, string | Date | null];
}>;

export type PagePagerResponse = PagerResponse<PageWithoutContent>;
