import { AxiosStatic } from 'axios';
import { CategoryApi, TagApi, PostApi } from './datas';
import {
  HookFunction,
  HttpInstance,
  ThemeFunctions,
  LayoutFunctions,
  LocaleFunctions,
  SettingsFunctions,
} from './functions';

export interface VueExtraPrototypes
  extends Pick<ThemeFunctions, 'getCurrentTheme' | 'getThemes' | 'isDarkTheme'>,
    Pick<LayoutFunctions, 'hasWidget' | 'getWidgets'>,
    Pick<
      LocaleFunctions,
      'getDefaultLocale' | 'getSupportLanguages' | 'addSupportLanguages' | 'setDefaultLocale' | 'setLocale'
    >,
    Pick<
      SettingsFunctions,
      'getDomain' | 'getLogo' | 'getStaticDir' | 'getApiPath' | 'getCopyright' | 'getICP' | 'getUserInfo'
    > {
  hook: HookFunction;
  categoryApi: CategoryApi;
  tagApi: TagApi;
  postApi: PostApi;
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
