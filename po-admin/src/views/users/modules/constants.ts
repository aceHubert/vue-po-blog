// 表格列信息
const table: Table = ({ i18nRender }) => ({
  columns: [
    {
      title: i18nRender('core.page-user.column.username', 'Username'),
      align: 'left',
      dataIndex: 'username',
      width: '285px',
      ellipsis: true,
      showInMobile: true,
      showInTablet: true,
      scopedSlots: { customRender: 'username' },
    },
    {
      title: i18nRender('core.page-user.column.name', 'Name'),
      align: 'left',
      dataIndex: 'name',
      ellipsis: true,
      scopedSlots: { customRender: 'name' },
    },
    {
      title: i18nRender('core.page-user.column.mobile', 'Mobile'),
      align: 'center',
      dataIndex: 'mobile',
      scopedSlots: { customRender: 'mobile' },
    },
    {
      title: i18nRender('core.page-user.column.email', 'Email'),
      align: 'center',
      dataIndex: 'email',
      scopedSlots: { customRender: 'email' },
    },
    {
      title: i18nRender('core.page-user.column.role', 'Role'),
      align: 'center',
      dataIndex: 'userRole',
      width: '120px',
      showInTablet: true,
      scopedSlots: { customRender: 'userRole' },
    },
    {
      title: i18nRender('core.page-user.column.create_time', 'CreateTime'),
      align: 'center',
      dataIndex: 'createTime',
      width: '160px',
      showInTablet: true,
      scopedSlots: { customRender: 'createTime' },
    },
  ],
});

// 表格里面的列key value
const filters = {};

export { table, filters };
