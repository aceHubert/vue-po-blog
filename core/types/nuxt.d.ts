import VueI18n, { IVueI18n } from 'vue-i18n';
import { categoryApi, tagApi, postApi, siteApi } from 'src/includes/datas';

declare module '@nuxt/types' {
  interface Context {
    axios: AxiosStatic;
    $http: AxiosInstance;
    $i18n: VueI18n & IVueI18n;
    categoryApi: typeof categoryApi;
    tagApi: typeof tagApi;
    postApi: typeof postApi;
    siteApi: typeof siteApi;
  }
}
