import { PagerQuery, PagerResponse } from './request';

export interface OptionsApi {
    getList(query?: any): Promise<any>;
    create(data: any): Promise<true>;
  }
  