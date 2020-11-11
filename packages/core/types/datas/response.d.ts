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

export interface PagerResponse<T> extends Omit<Response<T>, 'model'> {
  models: Array<T>;
  pageInfo: PagerInfo;
}
