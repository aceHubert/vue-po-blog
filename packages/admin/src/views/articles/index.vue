<template>
  <a-card :bordered="false">
    <SearchForm ref="searchForm" @search="handleSearch" />
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleCreate">新建</a-button>
      <!-- <a-button type="primary" icon="import" @click="importHandler">导入</a-button> -->
    </div>
    <STable
      ref="table"
      size="default"
      rowKey="id"
      :scroll="{ x: 1300 }"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      showPagination="true"
    >
      <span slot="status" slot-scope="text">
        <a-badge :status="text | statusTypeFilter" :text="text | statusFilter($i18n)" />
      </span>
      <!-- <span slot="syncStatus" slot-scope="text">
          <a-badge :status="text | syncStatusTypeFilter" :text="text | syncStatusFilter" />
        </span> -->
      <span slot="summary" slot-scope="text">
        <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
      </span>
      <span slot="createTime" slot-scope="text">
        {{ text | dateFormat }}
      </span>
      <span slot="titles" slot-scope="text">
        <ellipsis :length="15" tooltip>{{ text }}</ellipsis>
      </span>
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleSync(record)">同步</a>
          <a-divider type="vertical" />
          <a v-if="record.status === 1" @click="handleModifyStatus(record, 2)">发布</a>
          <a v-else-if="record.status === 2" @click="handleModifyStatus(record, 1)">草稿箱</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除这篇文章？" @confirm="handleDelete(record)" okText="是" cancelText="否">
            <a href="#">删除</a>
          </a-popconfirm>
        </template>
      </span>
    </STable>
  </a-card>
</template>

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
      this.$router.push({ name: 'articles-id', params: { id: row.id } });
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
    // handleSync(record) {
    //   publishByteBlogs({ id: record.id }).then((res) => {
    //     const { success } = res;
    //     if (success === 1) {
    //       this.$notification.success({
    //         message: '同步成功',
    //         description: '已存入ByteBlogs草稿箱,您可以去ByteBlogs进行发布',
    //       });
    //       this.$refs.table.refresh();
    //     }
    //   });
    // },
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
    // goByteBlogsEdit() {
    //   window.open('https://www.byteblogs.com/editor/posts', '_blank');
    // },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning',
        });
        return;
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000,
      });
      this.postForm.status = 1;
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
