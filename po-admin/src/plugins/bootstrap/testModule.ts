import { VueConstructor } from 'vue';
import { Table } from 'types/datas/table';
import { ModuleOptions } from 'types/module-options';

export default function (Vue: VueConstructor, opts: ModuleOptions) {
  const { hook } = opts;
  hook('user:columns', function (columns: ReturnType<Table>['columns']) {
    columns.push({
      title: 'Description',
      dataIndex: 'description',
      hideInMobile: true,
    });
    return columns;
  });
}
