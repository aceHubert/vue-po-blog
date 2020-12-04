<template>
  <a-card :bordered="false">
    <a-table :columns="columns" :data-source="data">
      <span slot="desc" slot-scope="text">{{ text }} <a-divider type="vertical" /> <a>查看详情</a></span>
      <span slot="action" slot-scope="text, record">
        <a @click="start(record.pluginId)">启用</a>
        <a-divider type="vertical" />
        <a @click="stop(record.pluginId)">停用</a>
        <a-divider type="vertical" />
        <a @click="unload(record.pluginId)">卸载</a>
      </span>
    </a-table>
  </a-card>
</template>

<script>
import { pluginApi } from '@/includes/datas';
const columns = [
  {
    dataIndex: 'title',
    key: 'title',
    title: '插件',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '作者',
    dataIndex: 'provider',
    key: 'provider',
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc',
    scopedSlots: { customRender: 'desc' },
  },
  {
    title: '版本号',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

export default {
  name: 'PluginsInstalled',
  data() {
    return {
      data: [],
      columns,
    };
  },
  created() {
    this.getInstalledPluginList();
  },
  methods: {
    getInstalledPluginList() {
      pluginApi.getInstalledPluginList().then((res) => {
        this.data = res.rows;
      });
    },
    start(pluginId) {
      pluginApi.startPlugin(pluginId).then((res) => {});
    },
    unload(pluginId) {
      pluginApi.unload(pluginId).then((res) => {});
    },
    stop(pluginId) {
      pluginApi.stopPlugin(pluginId).then((res) => {});
    },
  },
};
</script>
