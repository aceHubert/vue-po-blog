import Vue, { VueConstructor } from 'vue';
import { ModuleOptions } from 'types/module-options';

export default function (_Vue: VueConstructor, opts: ModuleOptions) {
  const { hook } = opts;
  hook('user:columns', function () {
    return function (this: Vue, i18nRender: (key: string, fallback: string) => string) {
      const h = this.$createElement;
      return [
        {
          title: i18nRender('plugin-test.page-user.column.description', 'Description'),
          dataIndex: 'description',
          customRender: function (value: any, row: Record<string, any>) {
            return h('a', { domProps: { href: 'javascript:;' } }, row.displayName);
          },
          customRenderInline: function (value: any, row: Record<string, any>) {
            return h('a', { domProps: { href: 'javascript:;' } }, row.displayName);
          },
        },
      ];
    };
  });
}
