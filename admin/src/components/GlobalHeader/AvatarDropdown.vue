<template>
  <a-dropdown v-if="user && user.name" placement="bottomRight">
    <span class="ant-pro-account-avatar">
      <a-avatar
        size="small"
        :src="user.photo || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'"
        class="antd-pro-global-header-index-avatar"
      />
      <span>{{ user.name }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">
        <template v-if="showMenu">
          <a-menu-item key="center" @click="handleAction('center')">
            <a-icon type="user" />
            {{ i18nRender('avatarDropdown.user.center') }}
          </a-menu-item>
          <a-menu-item key="settings" @click="handleAction('settings')">
            <a-icon type="setting" />
            {{ i18nRender('avatarDropdown.user.settings') }}
          </a-menu-item>
          <a-menu-divider />
        </template>
        <a-menu-item key="logout" @click="handleLogout">
          <a-icon type="logout" />
          {{ i18nRender('avatarDropdown.user.logout') }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
  </span>
</template>

<script>
import { Modal } from 'ant-design-vue';

function i18nRender(key) {
  switch (key) {
    case 'avatarDropdown.user.center':
      return 'User Center';
    case 'avatarDropdown.user.settings':
      return 'Settings';
    case 'avatarDropdown.user.logout':
      return 'Logout';
    case 'avatarDropdown.dialog.logout.title':
      return 'Message';
    case 'avatarDropdown.dialog.logout.content':
      return 'Do you really log-out?';
    default:
      return key;
  }
}

export default {
  name: 'AvatarDropdown',
  props: {
    user: {
      type: Object,
      default: () => null,
    },
    showMenu: {
      type: Boolean,
      default: true,
    },
    i18nRender: {
      type: Function,
      default: i18nRender,
    },
  },
  methods: {
    handleAction(key) {
      this.$emit('action', key);
    },
    handleLogout() {
      Modal.confirm({
        title: this.i18nRender('avatarDropdown.dialog.logout.title'),
        content: this.i18nRender('avatarDropdown.dialog.logout.content'),
        onOk: () => {
          this.handleAction('logout');
        },
        onCancel() {},
      });
    },
  },
};
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
</style>
