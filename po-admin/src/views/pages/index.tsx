import { Vue, Component, Ref, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { snakeCase } from 'lodash-es';
import { trailingSlash } from '@/utils/path';
import { AsyncTable, SearchForm } from '@/components';
import { gql, formatError } from '@/includes/functions';
import { PostCommentStatus, PostStatus, UserCapability } from '@/includes/datas';
import { userStore } from '@/store/modules';
import { table } from './modules/constants';
import classes from './styles/index.less?module';

// Types
import { PagedQuery, Page, PagePagedQuery, PagePagedResponse } from 'types/datas';
import { DataSourceFn } from '@/components/async-table/AsyncTable';
import { StatusOption, BlukAcitonOption } from '@/components/search-form/SearchForm';

type QueryParams = Omit<PagePagedQuery, keyof PagedQuery<{}>>;

enum BlukActions {
  MoveToTrash = 'moveToTrash',
  Restore = 'restore',
}

{
  /* <router>
{
  prop:true,
  meta:{
    title: 'All Pages',
  }
}
</router> */
}

@Component<PageIndex>({
  name: 'PageIndex',
  meta: {
    capabilities: [UserCapability.EditPages],
  },
  asyncData({ error, $i18n, graphqlClient }) {
    // 获取分类
    return graphqlClient
      .query<{
        statusCounts: Array<{ status: PostStatus; count: number }>;
        monthCounts: Array<{ month: string; count: number }>;
      }>({
        query: gql`
          query getFilters {
            statusCounts: pageCountByStatus {
              status
              count
            }
            monthCounts: pageCountByMonth {
              month
              count
            }
          }
        `,
      })
      .then(({ data }) => {
        return {
          statusCounts: data.statusCounts,
          allMonths: data.monthCounts,
        };
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({
          statusCode: statusCode || 500,
          message: $i18n.tv(`core.error.${statusCode}`, message) as string,
        });
      });
  },
})
export default class PageIndex extends Vue {
  @InjectReactive({ from: 'isMobile' }) isMobile!: boolean;
  @Ref('table') table!: AsyncTable;

  // type 定义
  selectedRowKeys!: string[];
  statusCounts!: Array<{ status: PostStatus; count: number }>;
  allMonths!: Array<{ month: string; count: number }>;
  itemCount!: number;
  searchQuery!: QueryParams;
  blukApplying!: boolean;

  data() {
    const query = this.$route.query as Dictionary<string | null>;
    let date = '';
    let author = null;
    try {
      author = query.author ? parseInt(query.author) : null;
      // yyyyMM
      date = query.d && query.d.length === 6 ? query.d : '';
    } catch {
      // ignore error
    }

    return {
      selectedRowKeys: [],
      searchQuery: {
        author,
        date,
      },
      statusCounts: [],
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

  // 状态选项 添加 All 选项
  get statusOptions(): StatusOption[] {
    return [
      {
        value: undefined,
        label: this.$tv('core.page-page.status.all', 'All') as string,
        // 总数不记录 trash 状态
        count: this.statusCounts.reduce((prev, curr) => {
          return prev + (curr.status === PostStatus.Trash ? 0 : curr.count);
        }, 0),
        keepStatusShown: true,
      },
      ...this.statusCounts.map(({ status, count }) => ({
        value: status,
        label: this.$tv(`core.page-post.status.${snakeCase(status)}`, status) as string,
        count,
      })),
    ];
  }

  // a-select options, 添加 All 选项
  get dateOptions(): Array<{ value: string; label: string }> {
    return [
      {
        value: '',
        label: this.$tv('core.page-page.search.all_dates', 'All Dates') as string,
      },
      ...this.allMonths.map(({ month }) => ({
        value: month,
        label: `${month.substr(0, 4)}-${month.substr(5)}`,
      })),
    ];
  }

  // 批量操作
  get blukActionOptions(): BlukAcitonOption[] {
    return this.searchQuery.status === PostStatus.Trash
      ? [
          {
            value: BlukActions.Restore,
            label: this.$tv('core.page-page.search.bulk_restore_action', 'Restore') as string,
          },
        ]
      : [
          {
            value: BlukActions.MoveToTrash,
            label: this.$tv('core.page-page.search.bulk_trash_action', 'Move To Trash') as string,
          },
        ];
  }

  // 加载 table 数据
  loadData({ page, size }: Parameters<DataSourceFn>[0]) {
    return this.graphqlClient
      .query<{ pages: PagePagedResponse }, PagePagedQuery>({
        query: gql`
          query getPages($keyword: String, $status: POST_STATUS, $date: String, $limit: Int, $offset: Int) {
            pages(keyword: $keyword, status: $status, date: $date, limit: $limit, offset: $offset) {
              rows {
                id
                title
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
          ...this.searchQuery,
          offset: (page - 1) * size,
          limit: size,
        },
      })
      .then(({ data }) => {
        this.itemCount = data.pages.total;
        return data.pages;
      })
      .catch((err) => {
        const { message } = formatError(err);
        throw new Error(message);
      });
  }

  // 刷新状态数量
  refreshStatusCounts() {
    return this.graphqlClient
      .query<{ statusCounts: Array<{ status: PostStatus; count: number }> }>({
        query: gql`
          query getStatusCounts {
            statusCounts: pageCountByStatus {
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
        this.$message.error(this.$tv(`core.error.${statusCode}`, message) as string);
      });
  }

  // 刷新 table, 会调用loadDate
  refreshTable() {
    this.table.refresh();
  }

  // 获取预览链接（草稿状态）
  getPreviewUrl(id: string) {
    if (process.client) {
      return `${trailingSlash(this.$userOptions['home'])}/${id}`;
    }
    return '#none';
  }

  // 获取显示链接（发布状态）
  getViewUrl(id: string) {
    if (process.client) {
      return `${trailingSlash(this.$userOptions['home'])}/${id}`;
    }
    return '#none';
  }

  // keyword 的搜索按纽
  handleSearch() {
    this.refreshTable();
  }

  // filter 按纽
  handleFilter() {
    this.updateRouteQuery({
      d: this.searchQuery.date,
    });
    this.refreshTable();
  }

  // 批量操作
  handleBlukApply(action: string | number) {
    if (!this.selectedRowKeys.length) {
      this.$message.warn({
        content: this.$tv('core.page-page.tips.bulk_row_reqrired', 'Please choose a row!') as string,
      });
      return;
    }
    if (action === BlukActions.MoveToTrash || action === BlukActions.Restore) {
      this.blukApplying = true;
      this.graphqlClient
        .mutate<{ result: boolean }, { ids: string[] }>({
          mutation:
            action === BlukActions.MoveToTrash
              ? gql`
                  mutation blukModifyStatus($ids: [ID!]!) {
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
          const { message } = formatError(err);
          this.$message.error(message);
        })
        .finally(() => {
          this.blukApplying = false;
        });
    }
  }

  // 行选择
  handleSelectChange(selectedRowKeys: Array<string | number>) {
    this.selectedRowKeys = selectedRowKeys as any;
  }

  // 修改状态
  handleModifyStatus(id: string, status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation updateStatus($id: ID!, $status: POST_STATUS!) {
            result: updatePostOrPageStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id,
          status,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshStatusCounts();
          this.refreshTable();
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 重置
  handleRestore(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation restorePostOrPage($id: ID!) {
            result: restorePostOrPage(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshStatusCounts();
          this.refreshTable();
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 删除
  handleDelete(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation deletePost($id: ID!) {
            result: deletePostOrPage(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => {
        if (data?.result) {
          this.refreshStatusCounts();
          this.refreshTable();
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
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
    const getStatusText = (record: Page) => {
      if (!this.searchQuery.status) {
        if (record.status === PostStatus.Draft) {
          return this.$tv('core.page-page.status.draft', 'Draft');
        } else if (record.status === PostStatus.Trash) {
          return this.$tv('core.page-page.status.trash', 'Trash');
        } else if (record.status === PostStatus.Private) {
          return this.$tv('core.page-page.status.private', 'Private');
        }
      }
      return;
    };

    const renderActions = (record: Page) => (
      <div class={classes.actions}>
        {record.status === PostStatus.Trash
          ? [
              <a
                href="#none"
                title={this.$tv('core.page-page.btn_tips.restore', 'Restore this post') as string}
                onClick={m.stop.prevent(this.handleRestore.bind(this, record.id))}
              >
                {this.$tv('core.page-page.btn_text.restore', 'Restore')}
              </a>,
              <a-divider type="vertical" />,
              <a-popconfirm
                title={this.$tv('core.page-page.tips.delete_pop_content', 'Do you really want to delete this post?')}
                okText={this.$tv('core.page-page.btn_text.delete_pop_ok_text', 'Ok')}
                cancelText={this.$tv('core.page-page.btn_text.delete_pop_cancel_text', 'No')}
                onConfirm={m.stop.prevent(this.handleDelete.bind(this, record.id))}
              >
                <a
                  href="#none"
                  title={this.$tv('core.page-page.btn_tips.delete', 'Delete this post permanently') as string}
                >
                  {this.$tv('core.page-page.btn_text.delete', 'Delete Permanently')}
                </a>
              </a-popconfirm>,
            ]
          : [
              <nuxt-link
                to={{ name: 'pages-edit', params: { id: String(record.id) } }}
                title={this.$tv('core.page-page.btn_tips.edit', 'Edit') as string}
              >
                {this.$tv('core.page-page.btn_text.edit', 'Edit')}
              </nuxt-link>,
              <a-divider type="vertical" />,
              <a
                href="#none"
                title={this.$tv('core.page-page.btn_tips.move_to_trash', 'Move to trash') as string}
                onClick={m.stop.prevent(this.handleModifyStatus.bind(this, record.id, PostStatus.Trash))}
              >
                {this.$tv('core.page-page.btn_text.move_to_trash', 'Trash')}
              </a>,
              <a-divider type="vertical" />,
              record.status === PostStatus.Draft ? (
                <a
                  href={this.getPreviewUrl(record.id)}
                  title={this.$tv('core.page-page.btn_tips.preview', 'Preview this post') as string}
                >
                  {this.$tv('core.page-page.btn_text.preview', 'Preview')}
                </a>
              ) : (
                <a
                  href={this.getViewUrl(record.id)}
                  title={this.$tv('core.page-page.btn_tips.view', 'View this post') as string}
                >
                  {this.$tv('core.page-page.btn_text.view', 'View')}
                </a>
              ),
            ]}
      </div>
    );

    // $scopedSolts 不支持多参数类型定义
    const scopedSolts = () => {
      return {
        titles: (text: Page['title'], record: Page & { expand?: boolean }) => (
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
                  {record.author ? (
                    <nuxt-link
                      to={{
                        name: 'users-profile',
                        query: record.author.id === userStore.id ? {} : { id: String(record.author.id) },
                      }}
                      title={this.$tv('core.page-page.btn_tips.edit', 'Edit') as string}
                    >
                      {record.author.displayName}
                    </nuxt-link>
                  ) : (
                    '-'
                  )}
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
        author: (text: Page['author']) =>
          text ? (
            <nuxt-link
              to={{
                name: 'users-profile',
                query: text.id === userStore.id ? {} : { id: text.id },
              }}
              title={this.$tv('core.page-page.btn_tips.edit', 'Edit') as string}
            >
              {text.displayName}
            </nuxt-link>
          ) : (
            '-'
          ),
        commentCount: (text: string, record: Page) => (record.commentStatus === PostCommentStatus.Enable ? text : '-'),
        createTime: (text: string) => $filters.dateFormat(text),
      } as any;
    };

    return (
      <a-card class="post-index" bordered={false}>
        <SearchForm
          keywordPlaceholder={this.$tv('core.page-page.search.keyword_placeholder', 'Search Pages') as string}
          itemCount={this.itemCount}
          statusOptions={this.statusOptions}
          blukAcitonOptions={this.blukActionOptions}
          blukApplying={this.blukApplying}
          onSearch={this.handleSearch.bind(this)}
          onBlukApply={this.handleBlukApply.bind(this)}
        >
          <template slot="filter">
            <a-select
              vModel={this.searchQuery.date}
              options={this.dateOptions}
              placeholder={this.$tv('core.page-page.search.choose_date', 'Choose date')}
              style="min-width:100px;"
            ></a-select>
            <a-button ghost type="primary" onClick={this.handleFilter.bind(this)}>
              {this.$tv('core.page-page.search.filter_btn_text', 'Filter')}
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
