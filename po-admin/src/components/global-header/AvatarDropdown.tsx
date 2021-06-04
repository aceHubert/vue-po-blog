import { Vue, Component, Prop, Inject, Emit } from 'nuxt-property-decorator';
import { ConfigConsumerProps } from '../config-provider/configConsumerProps';

// Types
import * as tsx from 'vue-tsx-support';
import { Dropdown } from 'ant-design-vue/types/dropdown/dropdown';
import { MenuItem } from 'ant-design-vue/types/menu/menu-item';

export enum Actions {
  Profile = 'profile',
  Settings = 'settings',
  SignOut = 'signout',
}

@Component({
  name: 'AvatarDropdown',
})
export default class AvatarDropdown extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<
      tsx.PickProps<AvatarDropdown, 'username' | 'imgSrc' | 'placement' | 'backgroundColor'>,
      'placement' | 'backgroundColor'
    >
  > &
    tsx.DeclareOnEvents<{
      onAction: (key: Actions) => void;
    }>;

  $scopedSlots!: tsx.InnerScopedSlots<{
    /** 自定义菜单项（Antd MenuItem）内容，参数为默认显示的菜单项 */
    menuItems?: MenuItem[];
  }>;

  @Inject({
    from: 'configProvider',
    default: () => ConfigConsumerProps,
  })
  configProvider!: typeof ConfigConsumerProps;

  @Prop(String) prefixCls?: string;
  /** 用户名 */
  @Prop({ type: String }) username?: string;
  /** 头像图片路径 */
  @Prop({ type: String }) imgSrc?: string;
  /** 显示下拉菜位置 */
  @Prop({ type: String, default: 'bottomRight' }) placement!: Dropdown['placement'];
  /** 当没有头像图片但有用户名（显示用户名第一个字母），显示的背景色 */
  @Prop({ type: String, default: '#f67280' }) backgroundColor!: string;

  @Emit('action')
  handleAction(key: Actions) {
    return key;
  }

  handleLogout() {
    this.$confirm({
      title: this.$tv('core.components.avatar_dropdown.dialog.signout.title', 'Message'),
      content: this.$tv('core.components.avatar_dropdown.dialog.signout.content', 'Do you really log-out?'),
      okText: this.$tv('core.components.avatar_dropdown.dialog.signout.okText', 'Yes') as string,
      cancelText: this.$tv('core.components.avatar_dropdown.dialog.signout.cancelText', 'No') as string,
      onOk: () => {
        this.handleAction(Actions.SignOut);
      },
      onCancel() {},
    });
  }

  render() {
    const customizePrefixCls = this.prefixCls;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('global-header-avatar-dropdown', customizePrefixCls);

    const defaultMenus: any[] = [
      <a-menu-item key="profile" onClick={() => this.handleAction(Actions.Profile)}>
        <a-icon type="user" />
        {this.$tv('core.components.avatar_dropdown.user.profile', 'Profile')}
      </a-menu-item>,
      <a-menu-item key="settings" onClick={() => this.handleAction(Actions.Settings)}>
        <a-icon type="setting" />
        {this.$tv('core.components.avatar_dropdown.user.settings', 'Settings')}
      </a-menu-item>,
      <a-menu-divider />,
    ];

    return (
      <a-dropdown class={prefixCls} placement={this.placement}>
        <span>
          {this.imgSrc ? (
            <a-avatar size="small" class={`${prefixCls}__avatar`} src={this.imgSrc} />
          ) : this.username ? (
            <a-avatar
              size="small"
              class={`${prefixCls}__avatar`}
              style={{ color: '#fff', backgroundColor: this.backgroundColor }}
            >
              {this.username.substr(0, 1).toUpperCase()}
            </a-avatar>
          ) : (
            <a-avatar size="small" icon="user" class={`${prefixCls}__avatar`} />
          )}
          <span class={`${prefixCls}__name`}>{this.username || ''}</span>
        </span>
        <template slot="overlay">
          <a-menu class={`${prefixCls}-overlay__menu`} selected-keys={[]}>
            {this.$scopedSlots.menuItems ? this.$scopedSlots.menuItems(defaultMenus) : defaultMenus}
            <a-menu-item key="signout" onClick={this.handleLogout.bind(this)}>
              <a-icon type="logout" />
              {this.$tv('core.components.avatar_dropdown.user.signout', 'Sign out')}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    );
  }
}
