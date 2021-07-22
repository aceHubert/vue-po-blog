import { Vue, Component } from 'nuxt-property-decorator';
import './styles/global-footer.less';

// Types
import * as tsx from 'vue-tsx-support';

@Component({
  name: 'GlobalFooter',
})
export default class GlobalFooter extends Vue {
  $scopedSlots!: tsx.InnerScopedSlots<{
    /** 在链接上方显示的自定义内容 */
    default?: void;
    /** 链接自定义内容 */
    links?: void;
  }>;

  render() {
    const prefixCls = 'global-footer';

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
