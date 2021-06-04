import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

/**
 * 扩展方法
 * tv(key, default, locale) 如果 key 的翻译没有则为 fallbackStr, 如果 fallbackStr 没有，则为 key
 */
Object.defineProperties(VueI18n.prototype, {
  tv: {
    value: function (this: VueI18n, key: VueI18n.Path, fallbackStr: string, ...values: any) {
      const locale = typeof values[0] == 'string' ? values[0] : undefined;
      return (this.te(key, locale) ? this.t(key, ...values) : fallbackStr) || key;
    },
    writable: false,
    enumerable: true,
    configurable: true,
  },
});

/**
 * 扩展VueI18n.tv方法添加到 Vue 实例中
 */
Object.defineProperties(Vue.prototype, {
  $tv: {
    value: function (this: Vue, key: VueI18n.Path, fallbackStr: string, ...values: any): VueI18n.TranslateResult {
      arguments.length;
      const i18n = this.$i18n;
      return i18n.tv(key, fallbackStr, ...values);
    },
    writable: false,
    enumerable: true,
    configurable: true,
  },
});
