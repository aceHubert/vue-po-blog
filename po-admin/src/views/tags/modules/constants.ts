// 表格列信息
const table: Table = ({ i18nRender }) => ({
  columns: [
    {
      title: i18nRender('core.page-tag.column.name', 'Name'),
      align: 'left',
      dataIndex: 'name',
      width: '300px',
      ellipsis: true,
      showInMobile: true,
      showInTablet: true,
      scopedSlots: { customRender: 'name' },
    },
    {
      title: i18nRender('core.page-tag.column.slug', 'Slug'),
      align: 'center',
      dataIndex: 'slug',
      showInTablet: true,
      scopedSlots: { customRender: 'slug' },
    },
    {
      title: i18nRender('core.page-tag.column.description', 'Description'),
      align: 'center',
      dataIndex: 'description',
      scopedSlots: { customRender: 'description' },
    },
    {
      title: i18nRender('core.page-tag.column.count', 'Count'),
      align: 'center',
      dataIndex: 'count',
      showInTablet: true,
      scopedSlots: { customRender: 'count' },
    },
  ],
});

export { table };
