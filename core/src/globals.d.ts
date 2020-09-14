import { RawLocation, RouteConfig } from 'vue-router';
import { AxiosStatic, AxiosInstance } from 'axios';
import VueI18n, { IVueI18n } from 'vue-i18n';

declare global {
  type LangConfig = {
    name: string;
    shortName: string;
    locale: string;
    alternate?: string;
  };

  interface Menu {
    title: string;
    icon: string;
    to: RawLocation;
    index: number;
    children?: Array<Menu>;
  }

  export type Dictionary<T> = Record<string, T>;
}

declare module 'vue/types/vue' {
  interface Vue {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }
}

declare module 'axios/index' {
  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryCount?: number;
  }
}

declare module '@nuxt/types' {
  interface Context {
    axios: AxiosStatic;
    $http: AxiosInstance;
    $i18n: VueI18n & IVueI18n;
    addRoutes: (routes: RouteConfig[]) => void;
  }
}
