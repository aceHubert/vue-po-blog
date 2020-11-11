import { http } from '../functions';

export const logApi = {
  fetchLogsList(query: any) {
    return http({
      url: '/logs/logs/v1/list',
      method: 'get',
      params: query,
    });
  },

  fetchLogs(id: number) {
    return http({
      url: `/logs/logs/v1/${id}`,
      method: 'get',
    });
  },

  deleteLogs(id: number) {
    return http({
      url: `/logs/logs/v1/${id}`,
      method: 'delete',
    });
  },
};
