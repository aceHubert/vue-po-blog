import { AxiosStatic, AxiosInstance } from 'axios';

declare module 'vue/types/vue' {
  interface Vue {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }

  interface VueConstructor {
    axios: AxiosStatic;
    $http: AxiosInstance;
  }
}
