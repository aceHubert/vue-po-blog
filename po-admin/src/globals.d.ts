// import { CreateElement, Component } from 'vue';
// import 'ant-design-vue/es/config-provider';

declare global {
  type Dictionary<T> = Record<string, T>;
  type ValueOf<T> = T[keyof T];

  type InitParams = {
    title: string;
    siteUrl: string;
    password: string;
    email: string;
    locale: string;
  };

  type TreeData = {
    title: string;
    key: string;
    children?: TreeData[];
  };

  type SimpleModelTreeData = {
    id: string | number;
    pId?: string | number;
    title: string;
    value: string;
  };

  type GlobalSettings = {
    /** router base */
    basePath: string;
    /** api server url */
    serverUrl: string;
    /** static assets url */
    siteUrl: string;
    /** web home url */
    homeUrl: string;
  };
}

declare module 'axios' {
  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryCount?: number;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $__recomputables?: Dictionary<{ backdoor: number }>;
  }
}

// declare module 'ant-design-vue/es/config-provider' {
//   export type ConfigConsumerProps = {
//     getPrefixCls: (suffixCls: string, customizePrefixCls?: string) => string;
//     renderEmpty: (h: CreateElement, componentName: string) => Component;
//   };
// }

// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {};
