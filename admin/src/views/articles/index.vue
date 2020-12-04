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
      showPagination="auto"
    >
      <template #titles="text">
        <ellipsis :length="15" tooltip>{{ text }}</ellipsis>
      </template>
      <template #author="text">
        {{ text || '-' }}
      </template>
      <template #summary="text">
        <ellipsis :length="30" tooltip>{{ text }}</ellipsis>
      </template>
      <template #status="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter($i18n.tv.bind($i18n))" />
      </template>
      <template #createTime="text">
        {{ text | dateFormat }}
      </template>
      <template slot="actions" slot-scope="text, record">
        <a :title="$tv('article.btnTips.edit')" @click="handleEdit(record)">{{
          $tv('article.btnText.edit', 'Edit')
        }}</a>
        <a-divider type="vertical" />
        <a v-if="record.status === 1" :title="$tv('article.btnTips.publish')" @click="handleModifyStatus(record, 2)">{{
          $tv('article.btnText.publish', 'Publish')
        }}</a>
        <a
          v-else-if="record.status === 2"
          :title="$tv('article.btnTips.moveToDraft')"
          @click="handleModifyStatus(record, 1)"
          >{{ $tv('article.btnText.moveToDraft', 'Move to Draft') }}</a
        >
        <a-divider type="vertical" />
        <a-popconfirm
          :title="$tv('article.dialog.delete.content', 'Do you really want to delete this article?')"
          :okText="$tv('article.dialog.delete.okBtn', 'Ok')"
          :cancelText="$tv('article.dialog.delete.cancelBtn', 'No')"
          @confirm="handleDelete(record)"
        >
          <a href="#none" :title="$tv('article.btnTips.delete')">{{ $tv('article.btnText.delete', 'Delete') }}</a>
        </a-popconfirm>
      </template>
    </STable>
  </a-card>
</template>

<router>
{
  prop:true,
  meta:{
    title: 'All Articles',
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
  props: {
    refresh: {
      type: Boolean,
      default: false,
    },
  },
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
      columns: table().columns,
    };
  },
  methods: {
    loadData(parameter) {
      return articleApi.getList(Object.assign(parameter, this.queryParam));
    },
    refreshTable() {
      this.$refs.table.refresh();
    },
    onSelectChange() {
      console.log(arguments);
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
