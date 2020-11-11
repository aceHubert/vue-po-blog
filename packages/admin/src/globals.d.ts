// import { RouteConfig } from 'vue-router';

declare global {
  type ModuleConfig = {
    moduleName: string;
    entry: string;
    styles?: string | string[];
    args?: Record<string, any>;
  };

  export type Dictionary<T> = Record<string, T>;
  export type ValueOf<T> = T[keyof T];
}

declare module 'axios/index' {
  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryCount?: number;
  }
}

// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {};