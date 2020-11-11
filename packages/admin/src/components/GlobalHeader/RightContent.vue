<template>
  <div :class="wrpCls">
    <avatar-dropdown
      :show-menu="showMenu"
      :current-user="currentUser"
      :class="prefixCls"
      @action="(key) => $emit('action', key)"
    />
    <select-lang-dropdown
      :locale="locale"
      :supportLanguages="supportLanguages"
      :class="prefixCls"
      @change="(locale) => $emit('changeLang', locale)"
      v-if="supportLanguages.length"
    />
  </div>
</template>

<script>
import AvatarDropdown from './AvatarDropdown';
import SelectLangDropdown from './SelectLangDropdown';

export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    SelectLangDropdown,
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action',
    },
    isMobile: {
      type: Boolean,
      default: () => false,
    },
    topMenu: {
      type: Boolean,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
    locale: {
      type: String,
      default: () => null,
    },
    supportLanguages: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showMenu: true,
      currentUser: {},
    };
  },
  computed: {
    wrpCls() {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${this.isMobile || !this.topMenu ? 'light' : this.theme}`]: true,
      };
    },
  },
  mounted() {
    setTimeout(() => {
      this.currentUser = {
        name: 'Serati Ma',
      };
    }, 1500);
  },
};
</script>
