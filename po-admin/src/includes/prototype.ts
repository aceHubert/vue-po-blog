/**
 * 挂载到 Vue.prototype 上，所有的组件（包括子模块主题和插件）都可以能过 this 去调用
 */

// functions
import hook from './functions/hooks';
import settingsFunctions from './functions/settings';

// Types
import { VueExtraPrototypes } from 'types/vue';

const { getBaseUrl, getGraphqlPath, getGraphqlWsPath, getApiPath } = settingsFunctions;

const prototypes: VueExtraPrototypes = {
  hook,
  getBaseUrl,
  getGraphqlPath,
  getGraphqlWsPath,
  getApiPath,
};

export default prototypes;
