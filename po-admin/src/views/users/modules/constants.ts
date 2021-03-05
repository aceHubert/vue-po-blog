// Types
import { Table } from 'types/constants';

// 表格列信息
const table: Table = ({ i18nRender }) => ({
  columns: [
    {
      title: i18nRender('user.column.loginName', 'LoginName'),
      align: 'left',
      dataIndex: 'loginName',
      width: '300px',
      ellipsis: true,
      scopedSlots: { customRender: 'loginName' },
    },
    {
      title: i18nRender('user.column.name', 'Name'),
      align: 'left',
      dataIndex: 'name',
      ellipsis: true,
      hideInMobile: true,
      scopedSlots: { customRender: 'name' },
    },
    {
      title: i18nRender('user.column.mobile', 'Mobile'),
      align: 'center',
      dataIndex: 'mobile',
      hideInMobile: true,
      scopedSlots: { customRender: 'mobile' },
    },
    {
      title: i18nRender('user.column.email', 'Email'),
      align: 'center',
      dataIndex: 'email',
      hideInMobile: true,
      scopedSlots: { customRender: 'email' },
    },
    {
      title: i18nRender('user.column.role', 'Role'),
      align: 'center',
      dataIndex: 'role',
      hideInMobile: true,
      scopedSlots: { customRender: 'role' },
    },
    {
      title: i18nRender('user.column.createTime', 'CreateTime'),
      align: 'center',
      dataIndex: 'createTime',
      width: '220px',
      hideInMobile: true,
      scopedSlots: { customRender: 'createTime' },
    },
  ],
});

// 表格里面的列key value
const filters = {};

export { table, filters };
