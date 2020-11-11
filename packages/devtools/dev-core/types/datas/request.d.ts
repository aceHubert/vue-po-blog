import { PagerInfo } from './response';

export type PagerQuery<T extends Record<string, any>> = {
  page?: number;
  size?: number;
} & T;

export type PagerResponse<T extends Record<string, any>> = {
  rows: T[];
  pager: PagerInfo;
};
