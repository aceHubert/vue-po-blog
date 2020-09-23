export type PagerInfo = {
  page: number;
  size: number;
  total: numver;
};

export interface Response<T> {
  success: boolean;
  message: string;
  resultCode: string;
  models: T;
}

export interface PagerResponse<T> extends Response<T> {
  models: Array<T>;
  pager: PagerInfo;
}
