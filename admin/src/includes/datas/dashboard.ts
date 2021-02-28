import { http } from '../functions';

// Types
import { DashboardApi } from 'types/datas/dashboard';

export const dashboardApi: DashboardApi = {
  getBlogQuantityTotal(query: any) {
    return http.get('/dashboard/blog-total/v1/quantity', { params: query });
  },
  getByteBlogsList(query: any) {
    return http.get('/dashboard/byte-blogs/v1/list', { params: query });
  },
  getByteBlogsChatList(query: any) {
    return http.get('/dashboard/byte-blogs-chat/v1/list', { params: query });
  },
  getPostsStatistics(query?: any) {
    return http.get('/dashboard/post-statistics/v1/list', { params: query });
  },
  getPostsRanking(query?: any) {
    return http.get('/dashboard/post-ranking/v1/list', { params: query });
  },
  getCountPerson(query?: any) {
    return http.get('/byteblogs/user/v1/count', { params: query });
  },
  getViewsChart(query?: any) {
    return http.get('/byteblogs/user-views/v1/chart', { params: query });
  },
  // getSystem(query?: any) {
  //   return http.get('/byteblogs/user-views/v1/chart', { params: query });
  // },
  // getMemory(query?: any) {
  //   return http.get('/monitor/memory/v1/gett', { params: query });
  // },
};
