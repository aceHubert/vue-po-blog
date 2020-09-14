import '@nuxt/types';

// todo: 待移除（从 core 生成 types）
declare module '@nuxt/types' {
  interface Context {
    axios: AxiosStatic;
    $http: AxiosInstance;
    $i18n: VueI18n & IVueI18n;
    addRoutes: (routes: RouteConfig[]) => void;
  }
}
