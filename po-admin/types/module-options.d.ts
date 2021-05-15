import { RouteConfig } from 'vue-router';
import { HookFunction, SettingsFunctions } from './functions';

export interface ModuleOptions
  extends Pick<
    SettingsFunctions,
    'getServerUrl' | 'getBasePath' | 'getGraphqlPath' | 'getGraphqlWsPath' | 'getApiPath'
  > {
  hook: HookFunction;
  addRoutes(routes: RouteConfig[], megreFn?: (oldRoutes: RouteConfig[], newRoutes: RouteConfig[]) => void): void;
}
