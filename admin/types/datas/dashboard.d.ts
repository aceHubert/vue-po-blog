import { PagerResponse } from './request';

export interface DashboardApi {
  getBlogQuantityTotal(query?: any): Promise<any>;
  getByteBlogsList(query?: any): Promise<any>;
  getByteBlogsChatList(query?: any): Promise<any>;
  getPostsStatistics(query?: any): Promise<any>;
  getPostsRanking(query?: any): Promise<any>;
  getCountPerson(query?: any): Promise<any>;
  getViewsChart(query?: any): Promise<any>;
}
