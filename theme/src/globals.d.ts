import '@nuxt/types';

declare global {
  export interface Menu {
    label: string;
    icon?: string;
    to: RawLocation;
    order: number;
    children?: Array<Menu>;
  }

  export type ComponentConfig = Record<string, string | { entry: string; args: Record<string, any> }>;

  export type Widget = {
    title?: string;
    config: ComponentConfig;
    order: number;
  };

  export type Category = {
    id: number;
    name: string;
  };

  export type Tag = {
    id: number;
    name: string;
    postsTotal: number;
  };

  export type UserInfo = {
    name: string;
    avatar?: string;
    email?: string;
    introduction?: string;
  };

  export type Dictionary<T> = Record<string, T>;
}

// todo: 待移除（从 core 生成 types）
declare module '@nuxt/types' {
  interface Context {
    axios: AxiosStatic;
    $http: AxiosInstance;
    $i18n: VueI18n & IVueI18n;
    categoryApi: Dictionary<Function>;
    tagApi: Dictionary<Function>;
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
    getUserInfo: () => UserInfo;
    getWidgets: (placename: string) => Widget[];
    categoryApi: Dictionary<Function>;
    tagApi: Dictionary<Function>;
    postApi: Dictionary<Function>;
    siteApi: Dictionary<Function>;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }
}
