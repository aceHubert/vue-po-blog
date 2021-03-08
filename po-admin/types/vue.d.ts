import { AxiosStatic } from 'axios';
import { ApolloClient } from 'apollo-client';
import { IVueI18n } from 'vue-i18n';
import { HookFunction, HttpInstance, SettingsFunctions } from './functions';

export interface VueExtraPrototypes
  extends Pick<SettingsFunctions, 'getBaseUrl' | 'getGraphqlPath' | 'getGraphqlWsPath' | 'getApiPath'> {
  hook: HookFunction;
}

declare module 'vue/types/vue' {
  interface Vue extends VueExtraPrototypes {
    axios: AxiosStatic;
    httpClient: HttpInstance;
    graphqlClient: InstanceType<typeof ApolloClient>;
    $tv: IVueI18n['tv'];
    $userOptions: Dictionary<string>;
    updateRouteQuery(query: Dictionary<string | undefined>, options?: { replace?: boolean }): void;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    httpClient: HttpInstance;
    graphqlClient: InstanceType<typeof ApolloClient>;
  }
}
