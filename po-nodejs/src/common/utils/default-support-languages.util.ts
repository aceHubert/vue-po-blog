export const defaultSupportLanguages: Readonly<LocaleConfig>[] = (function () {
  return [
    {
      name: 'English',
      shortName: 'EN',
      icon: 'static/icons/flags/4x3/am.svg',
      locale: 'en-US',
      alternate: 'en',
    },
    {
      name: '简体中文',
      shortName: '中',
      icon: 'static/icons/flags/4x3/cn.svg',
      locale: 'zh-CN',
    },
  ].map((item) => Object.freeze(item));
})();
