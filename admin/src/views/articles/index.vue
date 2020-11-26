<template>
  <a-card :bordered="false">
    <SearchForm ref="searchForm" @search="handleSearch" />
    <STable
      ref="table"
      size="small"
      rowKey="id"
      :scroll="{ x: 1300 }"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      :i18nRender="i18nRender"
      showPagination="auto"
    >
      <template #titles="text">
        <ellipsis :length="15" tooltip>{{ text }}</ellipsis>
      </template>
      <template #summary="text">
        <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
      </template>
      <template #status="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter(i18nRender)" />
      </template>
      <template #createTime="text">
        {{ text | dateFormat }}
      </template>
      <template slot="actions" slot-scope="text, record">
        <a @click="handleEdit(record)">{{ $t('article.btn.edit') }}</a>
        <a-divider type="vertical" />
        <a v-if="record.status === 1" @click="handleModifyStatus(record, 2)">{{ $t('article.btn.publish') }}</a>
        <a v-else-if="record.status === 2" @click="handleModifyStatus(record, 1)">{{ $t('article.btn.draft') }}</a>
        <a-divider type="vertical" />
        <a-popconfirm
          :title="$t('article.dialog.delete.content')"
          :okText="$t('article.dialog.delete.okBtn')"
          :cancelText="$t('article.dialog.delete.cancelBtn')"
          @confirm="handleDelete(record)"
        >
          <a href="#none">{{ $t('article.btn.delete') }}</a>
        </a-popconfirm>
      </template>
    </STable>
  </a-card>
</template>

<router>
{
  meta:{
    title: 'Articles',
    keepAlive: true,
  }
}
</router>

<script>
import { STable, Ellipsis } from '@/components';
import SearchForm from './modules/SearchForm';
import { articleApi } from '@/includes/datas';
import { filters, table } from './constants';

export default {
  name: 'ArticleIndex',
  components: {
    STable,
    Ellipsis,
    SearchForm,
  },
  filters: filters,
  data() {
    return {
      queryParam: {},
      options: {
        alert: {
          show: true,
          clear: () => {
            this.selectedRowKeys = [];
          },
        },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange,
        },
      },
      columns: table.columns,
    };
  },
  methods: {
    i18nRender(key) {
      return this.$i18n.t(`${key}`);
    },
    loadData(parameter) {
      return articleApi.getList(Object.assign(parameter, this.queryParam));
    },
    refreshTable() {
      this.$refs.table.refresh();
    },
    handleCreate() {
      this.$router.push({ name: 'articles-create' });
    },
    handleEdit(row) {
      this.$router.push({ name: 'articles-edit', params: { id: row.id } });
    },
    handleSearch(queryParam) {
      this.queryParam = queryParam;
      this.refreshTable();
    },
    handleModifyStatus(row, status) {
      articleApi
        .updateStatus(row.id, status)
        .then(() => {
          this.$notification.success({
            message: '更新状态成功',
          });
          this.$refs.table.refresh();
        })
        .catch(() => {
          this.$notification.error({
            message: '更新失败，请稍后重试',
          });
        });
    },
    handleDelete(row) {
      articleApi
        .delete(row.id)
        .then(() => {
          this.$notification.success({
            message: '删除成功',
          });
          this.$refs.table.refresh();
        })
        .catch(() => {
          this.$notification.error({
            message: '删除失败，请稍后重试',
          });
        });
    },
  },
};
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
