import { AxiosStatic } from 'axios';
import { CategoryApi, TagApi, ArticleApi } from './datas';
import { HookFunction, HttpInstance, LocaleFunctions, SettingsFunctions } from './functions';

export interface VueExtraPrototypes
  extends Pick<
      LocaleFunctions,
      'getDefaultLocale' | 'getSupportLanguages' | 'addSupportLanguages' | 'setDefaultLocale' | 'setLocale'
    >,
    Pick<SettingsFunctions, 'getDomain' | 'getStaticDir' | 'getSiderMenus' | 'getApiPath'> {
  hook: HookFunction;
  categoryApi: CategoryApi;
  tagApi: TagApi;
  articleApi: ArticleApi;
}

declare module 'vue/types/vue' {
  interface Vue extends VueExtraPrototypes {
    axios: AxiosStatic;
    $http: HttpInstance;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    $http: HttpInstance;
  }
}
