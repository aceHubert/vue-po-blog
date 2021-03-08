import { AntdComponent } from 'ant-design-vue/types/component';
import { Column } from 'ant-design-vue/types/table/column';
import { TranslateResult } from 'vue-i18n';

export type Table = (options: {
  i18nRender: (key: string, fallback: string) => TranslateResult;
}) => {
  columns: Array<
    Omit<Column, keyof AntdComponent> & {
      hideInMobile?: true;
    }
  >;
};
