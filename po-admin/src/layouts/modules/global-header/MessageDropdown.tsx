import { Vue, Component, Prop } from 'nuxt-property-decorator';
import './styles/message-dropdown.less';

// Types
import * as tsx from 'vue-tsx-support';
import { Dropdown } from 'ant-design-vue/types/dropdown/dropdown';
export type MessageItem = {
  title: string;
  content: string;
  to?: string;
};

@Component({
  name: 'MessageDropdown',
})
export default class AvatarDropdown extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<tsx.PickProps<AvatarDropdown, 'count' | 'messages' | 'placement'>, 'placement'>
  >;

  /** 消息数量 */
  @Prop(Number) count?: number;
  /** 消息内容 */
  @Prop({ type: Array, default: () => [] }) messages!: MessageItem[];
  /** 下拉选项显示位置 */
  @Prop({ type: String, default: 'bottomRight' }) placement!: Dropdown['placement'];

  render() {
    const prefixCls = 'global-header-message';

    return (
      <a-dropdown class={`${prefixCls}-dropdown`} placement={this.placement}>
        <a-badge count={this.count} dot>
          <a-icon type="bell" />
        </a-badge>
        <template slot="overlay">
          {this.messages.length ? (
            <a-list data-source={this.messages}>
              {(this.count || 0) > this.messages.length ? (
                <div
                  slot="loadMore"
                  style={{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }}
                >
                  <a-button onClick={this.$emit('showMore')}>
                    {this.$tv('core.layout_components.message_dropdown.show_more_btn_text', 'Show more')}
                  </a-button>
                </div>
              ) : null}
              <a-list-item></a-list-item>
            </a-list>
          ) : (
            <a-empty description={this.$tv('core.layout_components.message_dropdown.no_messasge', 'No messages!')} />
          )}
        </template>
      </a-dropdown>
    );
  }
}
