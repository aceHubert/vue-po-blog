import { Vue, Component, Prop, Inject } from 'nuxt-property-decorator';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';

// Types
import * as tsx from 'vue-tsx-support';

@Component({
  name: 'GlobalFooter',
})
export default class GlobalFooter extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<GlobalFooter, 'prefixCls'>>;

  $scopedSlots!: tsx.InnerScopedSlots<{
    /** 在链接上方显示的自定义内容 */
    default?: void;
    /** 链接自定义内容 */
    links?: void;
  }>;

  @Inject({
    from: 'configProvider',
    default: () => ConfigConsumerProps,
  })
  configProvider!: typeof ConfigConsumerProps;

  @Prop(String) prefixCls?: string;

  render() {
    const customizePrefixCls = this.prefixCls;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('global-footer', customizePrefixCls);

    return (
      <div class={`${prefixCls}-wrapper`}>
        {this.$scopedSlots.default ? this.$scopedSlots.default() : null}
        {this.$scopedSlots.links ? <div class={`${prefixCls}__links`}>{this.$scopedSlots.links()}</div> : null}
        <div class={`${prefixCls}__copyright`}>
          Copyright
          <a-icon type="copyright" /> 2019-{new Date().getFullYear()} <span> Plumemo</span>
        </div>
      </div>
    );
  }
}
