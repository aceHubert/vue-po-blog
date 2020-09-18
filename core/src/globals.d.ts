// import { RouteConfig } from 'vue-router';

declare global {
  export type Dictionary<T> = Record<string, T>;
}

declare module 'axios/index' {
  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryCount?: number;
  }
}
