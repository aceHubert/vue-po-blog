import '@nuxt/types';

declare global {
  interface Menu {
    label: string;
    icon?: string;
    to: RawLocation;
    index: number;
    children?: Array<Menu>;
  }

  export type Dictionary<T> = Record<string, T>;
}

// todo: 待移除（从 core 生成 types）
declare module '@nuxt/types' {
  interface Context {
    axios: AxiosStatic;
    $http: AxiosInstance;
    $i18n: VueI18n & IVueI18n;
    postApi: Dictionary<Function>;
    siteApi: Dictionary<Function>;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    axios: AxiosStatic;
    $http: AxiosInstance;
    hook: any;
    getLogo: any;
    getCopyright: any;
    getICP: any;
    postApi: Dictionary<Function>;
    siteApi: Dictionary<Function>;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }
}
