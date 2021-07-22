import { mixins, Component, Prop } from 'nuxt-property-decorator';
import { ConfigProvider as AntConfigProvider } from 'ant-design-vue';

// Types
import * as tsx from 'vue-tsx-support';
import { CSPConfig } from 'ant-design-vue/types/config-provider';
import { Locale } from 'ant-design-vue/types/locale-provider';

export type ConfigProviderProps = {
  prefixCls?: string;
  locale?: Locale;
  csp?: CSPConfig;
  autoInsertSpaceInButton?: boolean;
  pageHeader?: object;
  getPopupContainer?: (triggerNode: HTMLElement, dialogContext?: Vue | null) => HTMLElement;
  getPrefixCls: (suffixCls: string, customizePrefixCls?: string) => string;
  transformCellText?: Function;
  renderEmpty: Function;
  theme: string;
  device: string;
  i18nRender: (key: string, fallback: string) => string;
};

function getWatch(this: any, keys: string[] = []) {
  const watch: Dictionary<any> = {};
  keys.forEach((k) => {
    watch[k] = function (value: any) {
      this._proxyVm._data[k] = value;
    };
  });
  return watch;
}

/**
 * 扩展 Antd ConfigProvider
 */
@Component<ConfigProvider>({
  name: 'ConfigProvider',
  watch: { ...getWatch(['theme', 'device', 'i18nRender']) },
})
export default class ConfigProvider extends mixins(AntConfigProvider) {
  _tsx!: tsx.DeclareProps<Partial<Omit<ConfigProviderProps, 'getPrefixCls' | 'renderEmpty'>>>;
  _proxyVm!: Vue;

  @Prop({ type: String, default: 'light' }) theme!: string;
  @Prop({ type: String, default: 'desktop' }) device!: string;
  @Prop({ type: Function, default: (key: string, fallback: string) => fallback }) i18nRender!: (
    key: string,
    fallback: string,
  ) => string;
}
