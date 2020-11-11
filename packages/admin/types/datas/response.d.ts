export type PagerInfo = {
  page: number;
  size: number;
  total: number;
};

export interface Response<T> {
  success: boolean;
  message: string;
  resultCode: string;
  model: T;
}

export interface PagerResponse<T> extends Response<T> {
  models: Array<T>;
  pager: PagerInfo;
}
