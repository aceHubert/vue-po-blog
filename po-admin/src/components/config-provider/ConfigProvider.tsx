import { mixins, Component, Prop } from 'nuxt-property-decorator';
import { ConfigProvider as AntConfigProvider } from 'ant-design-vue';

// Types
import * as tsx from 'vue-tsx-support';
import { CSPConfig } from 'ant-design-vue/types/config-provider';
import { Locale } from 'ant-design-vue/types/locale-provider';

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
  watch: { ...getWatch(['theme', 'device']) },
})
export default class ConfigProvider extends mixins(AntConfigProvider) {
  _tsx!: tsx.DeclareProps<
    {
      prefixCls?: string;
      locale?: Locale;
      csp?: CSPConfig;
      autoInsertSpaceInButton?: boolean;
      pageHeader?: object;
      getPopupContainer?: (triggerNode: HTMLElement, dialogContext?: Vue | null) => HTMLElement;
      transformCellText?: Function;
      renderEmpty?: Function;
    } & tsx.PickProps<ConfigProvider, 'theme' | 'device'>
  >;
  _proxyVm!: Vue;

  // @Prop(String) prefixCls?: string;
  @Prop(String) theme?: string;
  @Prop(String) device?: string;

  // getPrefixCls(suffixCls: string, customizePrefixCls?: string) {
  //   const prefixCls = this.prefixCls === undefined ? 'po' : this.prefixCls;

  //   if (customizePrefixCls) return customizePrefixCls;
  //   return suffixCls ? prefixCls + '-' + suffixCls : prefixCls;
  // }

  // render() {
  //   return (
  //     <a-config-provider {...{ props: this.$attrs }}>
  //       {this.$scopedSlots.default ? this.$scopedSlots.default({}) : null}
  //     </a-config-provider>
  //   );
  // }
}
