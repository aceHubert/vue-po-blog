<template>
  <a-card :bordered="false">
    <a-table :columns="columns" :data-source="data">
      <a slot="name" slot-scope="text">tgest</a>
      <span slot="action" slot-scope="text, record">
        <a>启用</a>
        <a-divider type="vertical" />
        <a>删除</a>
        <a-divider type="vertical" />
        <a>删除</a>
        <a-divider type="vertical" />
        <a>更新</a>
      </span>
    </a-table>
  </a-card>
</template>

<script>
const columns = [
  {
    dataIndex: 'name',
    key: 'name',
    title: '插件',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    status: '停用',
    desc: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    status: '启用',
    desc: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    status: '启用',
    desc: 'Sidney No. 1 Lake Park',
  },
];
export default {
  name: 'PluginsInstalled',
  data() {
    return {
      data,
      columns,
    };
  },
};
</script>
