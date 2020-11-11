import { AxiosStatic } from 'axios';
import { HookFunction, HttpInstance, LocaleFunctions, SettingsFunctions } from './functions';

export interface VueExtraPrototypes
  extends Pick<
      LocaleFunctions,
      'getDefaultLocale' | 'getSupportLanguages' | 'addSupportLanguages' | 'setDefaultLocale' | 'setLocale'
    >,
    Pick<SettingsFunctions, 'getDomain' | 'getStaticDir' | 'getApiPath' | 'getUserInfo'> {
  hook: HookFunction;
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
