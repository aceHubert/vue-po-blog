import VueI18n, { IVueI18n } from 'vue-i18n';
import { AxiosStatic } from 'axios';
import { ApolloClient } from 'apollo-client';
import { VueExtraPrototypes } from './vue';
import { HttpInstance } from './functions';

declare module '@nuxt/types' {
  interface Context extends VueExtraPrototypes {
    axios: AxiosStatic;
    httpClient: HttpInstance;
    graphqlClient: InstanceType<typeof ApolloClient>;
    $i18n: VueI18n & IVueI18n;
  }
}
