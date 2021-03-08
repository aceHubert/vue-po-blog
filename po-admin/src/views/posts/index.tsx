import { Vue, Component, Ref, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { lowerFirst } from 'lodash-es';
import { trailingSlash } from '@/utils/path';
import { AsyncTable, SearchForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { PostCommentStatus, PostStatus } from '@/includes/datas/enums';
import { userStore } from '@/store/modules';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { PagerQuery, Post, PostPagerQuery, PostPagerResponse } from 'types/datas';
import { DataSource } from '@/components/AsyncTable/AsyncTable';
import { StatusOption, BlukAcitonOption } from '@/components/SearchFrom/SearchForm';
import { Term } from 'types/datas/term';

type QueryParams = Omit<PostPagerQuery, keyof PagerQuery<{}>> & { categoryId: string };

enum BlukActions {
  Edit = 'edit',
  MoveToTrash = 'moveToTrash',
  Restore = 'restore',
}

{
  /* <router>
{
  prop:true,
  meta:{
    title: 'All Posts',
    keepAlive: true,
  }
}
</router> */
}

@Component<PostIndex>({
  name: 'PostIndex',
  asyncData({ error, $i18n, graphqlClient }) {
    // 获取分类
    return graphqlClient
      .query<{
        categories: Term[];
        statusCounts: Array<{ status: PostStatus; count: number }>;
        monthCounts: Array<{ month: string; count: number }>;
      }>({
        query: gql`
          query getFilters {
            categories: terms(taxonomy: "category") {
              taxonomyId
              name
            }
            statusCounts: postCountByStatus {
              status
              count
            }
            monthCounts: postCountByMonth {
              month
              count
            }
          }
        `,
      })
      .then(({ data }) => {
        return {
          statusCounts: data.statusCounts,
          allCategories: data.categories,
          allMonths: data.monthCounts,
        };
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({
          statusCode: statusCode || 500,
          message: $i18n.tv(`error.${statusCode}`, message) as string,
        });
      });
  },
})
export default class PostIndex extends Vue {
  @InjectReactive({ from: 'isMobile' }) isMobile!: boolean;
  @Ref('table') table!: AsyncTable;

  // type 定义
  selectedRowKeys!: string[];
  statusCounts!: Array<{ status: PostStatus; count: number }>;
  allCategories!: Term[];
  allMonths!: Array<{ month: string; count: number }>;
  itemCount!: number;
  searchQuery!: QueryParams;
  blukApplying!: boolean;

  data() {
    const query = this.$route.query as Dictionary<string | null>;
    let categoryId = '';
    let date = '';
    let author = null;
    try {
      author = query.author ? parseInt(query.author) : null;
      categoryId = query.cid ? query.cid : '';
      // yyyyMM
      date = query.d && query.d.length === 6 ? query.d : '';
    } catch {
      // ignore error
    }

    return {
      selectedRowKeys: [],
      searchQuery: {
        categoryId,
        author,
        date,
      },
      statusCounts: [],
      allCategories: [],
      categoryId,
      allMonths: [],
      itemCount: 0,
      blukApplying: false,
    };
  }

  // 所有列配置。 动态计算，title 配置有多语言
  get columns() {
    return table({ i18nRender: (key, fallback) => this.$tv(key, fallback) }).columns;
  }

  // 动态计算，当是手机端时只显示第一列
  get fixedColumns() {
    if (this.isMobile) {
      return this.columns.filter((column) => column.hideInMobile !== true);
    }
    return this.columns;
  }

  // 添加 All 选项
  get statusOptions(): StatusOption<PostStatus | undefined>[] {
    return [
      {
        value: undefined,
        label: this.$tv('post.status.all', 'All') as string,
        // 总数不记录 trash 状态
        count: this.statusCounts.reduce((prev, curr) => {
          return prev + (curr.status === PostStatus.Trash ? 0 : curr.count);
        }, 0),
        keepStatusShown: true,
      },
      ...this.statusCounts.map(({ status, count }) => ({
        value: status,
        label: this.$tv(`post.status.${lowerFirst(status)}`, status) as string,
        count,
      })),
    ];
  }

  // a-tree-select treeData 级联异步加载, 添加 All 选项
  get categoryOptions(): Array<{ key: string; title: string; value: string; isLeaf?: boolean }> {
    return [
      {
        key: '',
        value: '',
        title: this.$tv('post.search.allCategories', 'All Categories') as string,
        isLeaf: true,
      },
      ...this.allCategories.map(({ taxonomyId, name }) => ({
        key: taxonomyId,
        value: taxonomyId,
        title: name,
      })),
    ];
  }

  // a-select options, 添加 All 选项
  get dateOptions(): Array<{ value: string; label: string }> {
    return [
      {
        value: '',
        label: this.$tv('post.search.allDates', 'All Dates') as string,
      },
      ...this.allMonths.map(({ month }) => ({
        value: month,
        label: `${month.substr(0, 4)}-${month.substr(5)}`,
      })),
    ];
  }

  // 批量操作
  get blukActionOptions(): BlukAcitonOption<BlukActions>[] {
    return this.searchQuery.status === PostStatus.Trash
      ? [
          {
            value: BlukActions.Restore,
            label: this.$tv('post.search.bulkRestoreAction', 'Restore') as string,
          },
        ]
      : [
          {
            value: BlukActions.Edit,
            label: this.$tv('post.search.bulkEditAction', 'Edit') as string,
          },
          {
            value: BlukActions.MoveToTrash,
            label: this.$tv('post.search.bulkTrashAction', 'Move To Trash') as string,
          },
        ];
  }

  // 异步加载分类
  loadCategories(treeNode: any) {
    if (treeNode.dataRef.children) {
      return Promise.resolve();
    }
    return this.graphqlClient
      .query<{ categories: Term[] }, { parentId: number }>({
        query: gql`
          query getCategories($parentId: ID!) {
            categories: terms(taxonomy: "category", parentId: $parentId) {
              taxonomyId
              name
            }
          }
        `,
        variables: {
          parentId: treeNode.dataRef.key,
        },
      })
      .then(({ data }) => {
        treeNode.dataRef.children = data.categories.map(({ taxonomyId, name }) => ({
          key: taxonomyId,
          value: taxonomyId,
          title: name,
        }));
        this.allCategories = [...this.allCategories];
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        this.$message.error(this.$tv(`error.${statusCode}`, message) as string);
      });
  }

  // 加载 table 数据
  loadData({ page, size }: Parameters<DataSource>[0]) {
    const { categoryId, ...restQuery } = this.searchQuery;
    return this.graphqlClient
      .query<{ posts: PostPagerResponse }, PostPagerQuery>({
        query: gql`
          query getPosts(
            $keyword: String
            $status: POST_STATUS
            $categoryIds: [ID!]
            $date: String
            $limit: Int
            $offset: Int
          ) {
            posts(
              keyword: $keyword
              status: $status
              categoryIds: $categoryIds
              date: $date
              limit: $limit
              offset: $offset
            ) {
              rows {
                id
                title
                excerpt
                status
                commentStatus
                commentCount
                author {
                  id
                  displayName
                }
                createTime: createdAt
              }
              total
            }
          }
        `,
        variables: {
          ...restQuery,
          categoryIds: categoryId ? [categoryId] : [],
          offset: (page - 1) * size,
          limit: size,
        },
      })
      .then(({ data }) => {
        this.itemCount = data.posts.total;
        return data.posts;
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        throw new Error(this.$tv(`error.${statusCode}`, message) as string);
      });
  }

  // 刷新状态数量
  refreshStatusCounts() {
    return this.graphqlClient
      .query<{ statusCounts: Array<{ status: PostStatus; count: number }> }>({
        query: gql`
          query getStatusCounts {
            statusCounts: postCountByStatus {
              status
              count
            }
          }
        `,
      })
      .then(({ data }) => {
        this.statusCounts = data.statusCounts;
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        this.$message.error(this.$tv(`error.${statusCode}`, message) as string);
      });
  }

  // 刷新 table, 会调用loadDate
  refreshTable() {
    this.table.refresh();
  }

  getPreviewUrl(id: string) {
    if (process.client) {
      return `${trailingSlash(this.$userOptions['home'].trim())}post/${id}`;
    }
    return '#none';
  }

  // keyword 的搜索按纽
  handleSearch(query: { keyword?: string; status?: PostStatus }) {
    Object.assign(this.searchQuery, query);
    this.refreshTable();
  }

  // filter 按纽
  handleFilter() {
    this.updateRouteQuery({
      cid: this.searchQuery.categoryId ? String(this.searchQuery.categoryId) : undefined,
      d: this.searchQuery.date,
    });
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: BlukActions) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({ content: this.$tv('post.bulkRowReqrired', 'Please choose a row!') as string });
      return;
    }
    if (action === BlukActions.MoveToTrash || action === BlukActions.Restore) {
      this.blukApplying = true;
      this.graphqlClient
        .mutate<{ result: boolean }, { ids: string[] }>({
          mutation:
            action === BlukActions.MoveToTrash
              ? gql`
                  mutation blukUpdatePostStatus($ids: [ID!]!) {
                    result: blukUpdatePostOrPageStatus(ids: $ids, status: Trash)
                  }
                `
              : gql`
                  mutation blukRestore($ids: [ID!]!) {
                    result: blukRestorePostOrPage(ids: $ids)
                  }
                `,
          variables: {
            ids: this.selectedRowKeys,
          },
        })
        .then(({ data }) => {
          if (data?.result) {
            this.selectedRowKeys = [];
            this.refreshStatusCounts();
            this.refreshTable();
          }
        })
        .catch((err) => {
          const { statusCode, message } = formatError(err);
          this.$message.error(this.$tv(`error.${statusCode}`, message) as string);
        })
        .finally(() => {
          this.blukApplying = false;
        });
    }
  }

  handleSelectChange(selectedRowKeys: Array<string | number>) {
    this.selectedRowKeys = selectedRowKeys as any;
  }

  // 修改状态
  handleModifyStatus(id: string, status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation updatePostStatus($id: ID!, $status: POST_STATUS!) {
            result: updatePostOrPageStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id,
          status,
        },
      })
      .then(() => {
        this.refreshStatusCounts();
        this.refreshTable();
      })
      .catch(() => {
        this.$message.error(this.$tv('post.status.errorTips', 'Status update failed!') as string);
      });
  }

  // 重置
  handleRestore(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation restorePost($id: ID!) {
            result: restorePostOrPage(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(() => {
        this.refreshStatusCounts();
        this.refreshTable();
      })
      .catch(() => {
        this.$message.error(this.$tv('post.restore.errorTips', 'Restore failed!') as string);
      });
  }

  // 删除
  handleDelete(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation deletePost($id: ID!) {
            result: removePostOrPage(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(() => {
        this.refreshStatusCounts();
        this.refreshTable();
      })
      .catch(() => {
        this.$message.error(this.$tv('post.delete.errorTips', 'Delete failed!') as string);
      });
  }

  render() {
    const $filters = this.$options.filters!;

    const getTitle = (dataIndex: string) => {
      return (this.columns as Array<{ title: string; dataIndex: string }>).find(
        (column) => column.dataIndex === dataIndex,
      )?.title;
    };

    // 在全部状态下时区分每一条的状态显示
    const getStatusText = (record: Post) => {
      if (!this.searchQuery.status) {
        if (record.status === PostStatus.Draft) {
          return this.$tv('post.status.draft', 'Draft');
        } else if (record.status === PostStatus.Trash) {
          return this.$tv('post.status.trash', 'Trash');
        } else if (record.status === PostStatus.Private) {
          return this.$tv('post.status.private', 'Private');
        }
      }
      return;
    };

    const renderActions = (record: Post) => (
      <div class={classes.actions}>
        {record.status === PostStatus.Trash
          ? [
              <a
                href="#none"
                title={this.$tv('post.btnTips.restore', 'Restore this post') as string}
                onClick={m.stop.prevent(this.handleRestore.bind(this, record.id))}
              >
                {this.$tv('post.btnText.restore', 'Restore')}
              </a>,
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv('post.btnTips.deletePopContent', 'Do you really want to delete this post?')}
                okText={this.$tv('post.btnText.deletePopOkBtn', 'Ok')}
                cancelText={this.$tv('post.btnText.deletePopCancelBtn', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a href="#none" title={this.$tv('post.btnTips.delete', 'Delete this post permanently') as string}>
                  {this.$tv('post.btnText.delete', 'Delete Permanently')}
                </a>
              </a-popconfirm>,
            ]
          : [
              <nuxt-link
                to={{ name: 'posts-edit', params: { id: String(record.id) } }}
                title={this.$tv('post.btnTips.edit', 'Edit') as string}
              >
                {this.$tv('post.btnText.edit', 'Edit')}
              </nuxt-link>,
              <a-divider type="vertical" />,
              <a
                href="#none"
                title={this.$tv('post.btnTips.trash', 'Move to trash') as string}
                onClick={m.stop.prevent(this.handleModifyStatus.bind(this, record.id, PostStatus.Trash))}
              >
                {this.$tv('post.btnText.moveToTrash', 'Trash')}
              </a>,
              <a-divider type="vertical" />,
              <a
                href={this.getPreviewUrl(record.id)}
                title={this.$tv('post.btnTips.preview', 'View this post') as string}
              >
                {this.$tv('post.btnText.preview', 'Preview')}
              </a>,
            ]}
      </div>
    );

    // $scopedSolts 不支持多参数类型定义
    const scopedSolts = () => {
      return {
        titles: (text: Post['title'], record: Post & { expand?: boolean }) => (
          <div class={[classes.columnTitle]}>
            <p class={[classes.title]}>
              <span class="text-ellipsis" style="max-width:180px;display:inline-block;">
                {text}
              </span>
              {getStatusText(record) ? (
                <span class="font-weight-bold ml-2" style="vertical-align: top;">
                  - {getStatusText(record)}
                </span>
              ) : null}
              <a-icon
                type={record.expand ? 'up-circle' : 'down-circle'}
                class="grey--text"
                onClick={() => {
                  this.$set(record, 'expand', !record.expand);
                }}
              ></a-icon>
            </p>

            {this.isMobile ? (
              <div class={[classes.content]} v-show={record.expand}>
                <p>
                  <span>{getTitle('author') || 'Author'}: </span>
                  <nuxt-link
                    to={{
                      name: 'users-profile',
                      query: record.author.id === userStore.id ? {} : { id: String(record.author.id) },
                    }}
                    title={this.$tv('post.btnTips.edit', 'Edit') as string}
                  >
                    {record.author.displayName}
                  </nuxt-link>
                </p>
                <p>
                  <span>{getTitle('commentCount') || 'Comment Count'}: </span>
                  {record.commentStatus === PostCommentStatus.Enable ? record.commentCount : '-'}
                </p>
                <p>
                  <span>{getTitle('createTime') || 'CreateTime'}: </span>
                  {$filters.dateFormat(record.createTime)}
                </p>
              </div>
            ) : null}
            {renderActions(record)}
          </div>
        ),
        author: (text: Post['author'], record: Post) => (
          <nuxt-link
            to={{
              name: 'users-profile',
              query: record.author.id === userStore.id ? {} : { id: String(record.author.id) },
            }}
            title={this.$tv('post.btnTips.edit', 'Edit') as string}
          >
            {text.displayName}
          </nuxt-link>
        ),
        commentCount: (text: string, record: Post) => (record.commentStatus === PostCommentStatus.Enable ? text : '-'),
        createTime: (text: string) => $filters.dateFormat(text),
      } as any;
    };

    return (
      <a-card class="post-index" bordered={false}>
        <SearchForm
          keywordPlaceholder={this.$tv('post.search.keywordPlaceholder', 'Search Post') as string}
          itemCount={this.itemCount}
          statusOptions={this.statusOptions}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onPreFilters={(query) => {
            Object.assign(this.searchQuery, query);
          }}
          onSearch={this.handleSearch.bind(this)}
          onBlukApply={this.handleBlukApply.bind(this)}
        >
          <template slot="filter">
            <a-select
              vModel={this.searchQuery.date}
              options={this.dateOptions}
              placeholder={this.$tv('post.search.chooseDate', 'Choose date')}
              style="min-width:100px;"
            ></a-select>
            <a-tree-select
              vModel={this.searchQuery.categoryId}
              treeData={this.categoryOptions}
              loadData={this.loadCategories.bind(this)}
              maxTagCount={3}
              placeholder={this.$tv('post.search.chooseCategory', 'Choose category')}
              style="min-width:120px;"
            ></a-tree-select>
            <a-button ghost type="primary" onClick={this.handleFilter.bind(this)}>
              {this.$tv('post.search.filterBtnText', 'Filter')}
            </a-button>
          </template>
        </SearchForm>
        <AsyncTable
          ref="table"
          rowKey="id"
          size="small"
          scroll={{ x: true, y: 0 }}
          columns={this.fixedColumns}
          dataSource={this.loadData.bind(this)}
          showPagination="auto"
          rowSelection={{
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.handleSelectChange.bind(this),
          }}
          rowClassName={() => classes.tableRow}
          {...{
            scopedSlots: scopedSolts(),
          }}
        ></AsyncTable>
      </a-card>
    );
  }
}
