import { AxiosStatic } from 'axios';
import { ApolloClient } from 'apollo-client';
import { IVueI18n } from 'vue-i18n';
import { HookFunction, HttpInstance, SettingsFunctions } from './functions';
import { UserCapability } from 'src/includes/datas';

export interface VueExtraPrototypes
  extends Pick<
    SettingsFunctions,
    'getServerUrl' | 'getBasePath' | 'getGraphqlPath' | 'getGraphqlWsPath' | 'getApiPath'
  > {
  hook: HookFunction;
}

declare module 'vue/types/vue' {
  interface Vue extends VueExtraPrototypes {
    axios: AxiosStatic;
    httpClient: HttpInstance;
    graphqlClient: InstanceType<typeof ApolloClient>;
    $tv: IVueI18n['tv'];
    $userOptions: Dictionary<string>;
    updateRouteQuery(
      query: Dictionary<string | undefined>,
      options?: { replace?: boolean; onComplete?: Function; onAbort?: (e: Error) => void },
    ): void;
    hasCapability(capabilities: UserCapability[]): boolean;
    hasCapability(...capabilities: UserCapability[]): boolean;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    httpClient: HttpInstance;
    graphqlClient: InstanceType<typeof ApolloClient>;
  }
}
