import { VueConstructor } from 'vue';
import { Table } from 'types/constants';
import { ModuleOptions } from 'types/module-options';

export default function (Vue: VueConstructor, opts: ModuleOptions) {
  const { hook } = opts;
  hook('user:columns', function (columns: ReturnType<Table>['columns']) {
    columns.push({
      title: 'Description',
      dataIndex: 'description',
    });
    return columns;
  });
}
