import { Vue, Component, Prop, Emit } from 'nuxt-property-decorator';

// Types
import * as tsx from 'vue-tsx-support';
import { Dropdown } from 'ant-design-vue/types/dropdown/dropdown';

export type User = {
  name: string;
  photo?: string;
};

export enum Actions {
  Profile = 'profile',
  Settings = 'settings',
  Logout = 'logout',
}

@Component({
  name: 'AvatarDropdown',
})
export default class AvatarDropdown extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<tsx.PickProps<AvatarDropdown, 'user' | 'showMenu' | 'placement'>, 'showMenu' | 'placement'>
  > &
    tsx.DeclareOnEvents<{
      onAction: (key: Actions) => void;
    }>;

  @Prop({ type: Object }) user?: User;
  @Prop({ type: Boolean, default: true }) showMenu!: boolean;
  @Prop({ type: String, default: 'bottomRight' }) placement!: Dropdown['placement'];

  @Emit('action')
  handleAction(key: Actions) {
    return key;
  }

  handleLogout() {
    this.$confirm({
      title: this.$tv('avatarDropdown.dialog.logout.title', 'Message'),
      content: this.$tv('avatarDropdown.dialog.logout.content', 'Do you really log-out?'),
      okText: this.$tv('avatarDropdown.dialog.logout.okText', 'Yes') as string,
      cancelText: this.$tv('avatarDropdown.dialog.logout.cancelText', 'No') as string,
      onOk: () => {
        this.handleAction(Actions.Logout);
      },
      onCancel() {},
    });
  }

  render() {
    return this.user ? (
      <a-dropdown class="po-avatar-dropdown" placement={this.placement}>
        <span>
          {this.user.photo ? (
            <a-avatar size="small" class="po-avatar-dropdown__avatar" src={this.user.photo} />
          ) : (
            <a-avatar size="small" class="po-avatar-dropdown__avatar" style="color: #fff; backgroundColor: #f67280">
              {this.user.name.substr(0, 1).toUpperCase()}
            </a-avatar>
          )}
          <span class="po-avatar-dropdown__name">{this.user.name}</span>
        </span>
        <template slot="overlay">
          <a-menu class="po-avatar-dropdown__menu" selected-keys={[]}>
            {this.showMenu
              ? this.$scopedSlots.menuItems
                ? this.$scopedSlots.menuItems(null)
                : [
                    <a-menu-item key="profile" onClick={() => this.handleAction(Actions.Profile)}>
                      <a-icon type="user" />
                      {this.$tv('avatarDropdown.user.profile', 'Profile')}
                    </a-menu-item>,
                    <a-menu-item key="settings" onClick={() => this.handleAction(Actions.Settings)}>
                      <a-icon type="setting" />
                      {this.$tv('avatarDropdown.user.settings', 'Settings')}
                    </a-menu-item>,
                    <a-menu-divider />,
                  ]
              : null}
            <a-menu-item key="logout" onClick={this.handleLogout.bind(this)}>
              <a-icon type="logout" />
              {this.$tv('avatarDropdown.user.logout', 'Logout')}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    ) : (
      <span class="po-avatar-dropdown-spin">
        <a-spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
      </span>
    );
  }
}
