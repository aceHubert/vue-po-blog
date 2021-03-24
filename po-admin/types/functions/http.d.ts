/**
 * 修改 axios response 的返回 为 response.data 的内容
 */
import { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';

type ResponseError = {
  success: false;
  message: string;
};

// response from service
export type Response<T> =
  | ({
      success: true;
    } & T)
  | ResponseError;

// response from service
export type PagedResponse<T> =
  | {
      success: true;
      rows: Array<T>;
      total: number;
    }
  | ResponseError;

export interface HttpInterceptorManager<V> extends AxiosInterceptorManager<V> {
  use<R = V>(onFulfilled?: (value: V) => R | Promise<R>, onRejected?: (error: any) => any): number;
}

export interface HttpInstance {
  <T = any, R = Response<T> | PagedResponse<T>>(config: AxiosRequestConfig): Promise<R>;
  <T = any, R = Response<T> | PagedResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;

  defaults: AxiosRequestConfig;
  interceptors: {
    request: HttpInterceptorManager<AxiosRequestConfig>;
    response: HttpInterceptorManager<AxiosResponse>;
  };

  getUri(config?: AxiosRequestConfig): string;
  request<T = any, R = Response<T> | PagedResponse<T>>(config: AxiosRequestConfig): Promise<R>;
  get<T = any, R = Response<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
  getList<T = any, R = PagedResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
  delete<T = any, R = Response<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
  head<T = any, R = Response<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
  options<T = any, R = Response<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = any, R = Response<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  put<T = any, R = Response<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  patch<T = any, R = Response<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
}
