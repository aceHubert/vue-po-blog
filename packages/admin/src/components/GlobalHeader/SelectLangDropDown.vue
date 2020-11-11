<template>
  <a-dropdown placement="bottomRight">
    <span class="ant-pro-drop-down">
      <template v-if="locale">{{ currentLanguage.shortName }}</template>
      <a-icon type="global" :title="$t('navBar.lang')" v-else />
    </span>
    <template v-slot:overlay>
      <a-menu class="ant-pro-drop-down menu" :selectedKeys="[currentLanguage.locale]" @click="handleChangeLang">
        <a-menu-item v-for="lang in supportLanguages" :key="lang.locale">
          <span role="img" :aria-label="lang.name">{{ lang.icon }}&nbsp;&nbsp;</span> {{ lang.name }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script>
export default {
  name: 'SelectLangDropdown',
  props: {
    locale: { type: String, default: () => null },
    supportLanguages: { type: Array, required: true, validate: (val) => !!val.length },
  },
  computed: {
    currentLanguage() {
      const locale = this.locale || (this.$i18n && this.$i18n.locale);
      const lang = this.supportLanguages.find((lang) => lang.locale === locale);
      if (lang) {
        return lang;
      } else {
        return this.supportLanguages[0];
      }
    },
  },
  methods: {
    handleChangeLang({ key }) {
      this.$emit('change', key);
    },
  },
};
</script>
