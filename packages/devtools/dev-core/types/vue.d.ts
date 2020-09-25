import { AxiosStatic, AxiosInstance } from 'axios';
import { CategoryApi, TagApi, PostApi } from './datas';
import { HookFunction, ThemeFunctions, LayoutFunctions, LocaleFunctions, SettingsFunctions } from './functions';

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
    $http: AxiosInstance;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }
}
