// Types
import { Table } from 'types/datas/table';

// 表格列信息
const table: Table = ({ i18nRender }) => ({
  columns: [
    {
      title: i18nRender('core.page-category.column.name', 'Name'),
      align: 'left',
      dataIndex: 'name',
      width: '300px',
      ellipsis: true,
      scopedSlots: { customRender: 'name' },
    },
    {
      title: i18nRender('core.page-category.column.slug', 'Slug'),
      align: 'center',
      dataIndex: 'slug',
      hideInMobile: true,
      scopedSlots: { customRender: 'slug' },
    },
    {
      title: i18nRender('core.page-category.column.description', 'Description'),
      align: 'center',
      dataIndex: 'description',
      hideInMobile: true,
      scopedSlots: { customRender: 'description' },
    },
    {
      title: i18nRender('core.page-category.column.count', 'Count'),
      align: 'center',
      dataIndex: 'count',
      hideInMobile: true,
      scopedSlots: { customRender: 'count' },
    },
  ],
});

export { table };
